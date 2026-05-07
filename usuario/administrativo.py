from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse
from django.views import View
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
import base64
import datetime
from datetime import time, timedelta
from django.contrib.sessions.models import Session
from django.utils import timezone
from django.contrib.auth.models import User, Group
from django.contrib.auth import logout
import json
import pytz
from usuario.api_queries import get_professor, get_student
from .models import imagenNoticia, noticias, RegistroLogsUser, prospecto, user_status
import requests
from django.core.mail import send_mail
from django.conf import settings
from .envioCorreo import Correo
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from django.contrib.auth.decorators import login_required


def registrar_accion(usuario, accion):
    registro = RegistroLogsUser(usuario=usuario, accion=accion)
    registro.save()


@csrf_exempt
@login_required
@require_POST
def cambiar_rol_ajax(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id', '').strip()
        rol = data.get('rol', '').strip()

        if not user_id or not rol:
            return JsonResponse({'error': 'Faltan parámetros'}, status=400)

        ROLES_PERMITIDOS = ['Estudiante', 'Docente']
        if rol not in ROLES_PERMITIDOS:
            return JsonResponse({'error': 'Rol no permitido'}, status=400)

        user = User.objects.get(username=user_id)

        # Limpiar grupos actuales y asignar el nuevo
        user.groups.clear()
        grupo, _ = Group.objects.get_or_create(name=rol)
        user.groups.add(grupo)
        return JsonResponse({'ok': True, 'nuevo_rol': rol})

    except User.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
@require_GET
def buscar_usuario_sugerencias(request):
    """Devuelve hasta 10 coincidencias parciales por cédula o correo."""
    from django.db.models import Q
    q = request.GET.get('q', '').strip()
    if len(q) < 2:
        return JsonResponse({'resultados': []})
    usuarios = User.objects.filter(
        Q(username__icontains=q) | Q(email__icontains=q)
    ).values('username', 'email')[:10]
    resultados = [
        {'cedula': u['username'], 'correo': u['email']}
        for u in usuarios
    ]
    return JsonResponse({'resultados': resultados})

@login_required
@require_GET
def buscar_usuario(request):
    # Mapa de tab → nombre de grupo en BD
    GRUPO_MAP = {
        'estudiante': 'Estudiante',
        'docente': 'Docente',
        'docente_estudiante': 'Docente y Estudiante',
        'prospecto': 'Prospecto',
    }
    id_user = request.GET.get('id_user', '').strip()
    email = request.GET.get('email', '').strip()
    tipo = request.GET.get('tipo', '').strip()

    if not id_user and not email:
        return JsonResponse({'error': 'Debes indicar cédula o correo'}, status=400)

    try:
        # --- Buscar usuario ---
        if '@' in id_user:
            user = User.objects.get(email__iexact=id_user)
        else:
            user = User.objects.get(username=id_user)

        # --- Validar grupo (excepto tab "activos") ---
        if tipo in GRUPO_MAP:
            if not user.groups.filter(name=GRUPO_MAP[tipo]).exists():
                return JsonResponse(
                    {'error': f'El usuario no pertenece al grupo "{GRUPO_MAP[tipo]}"'},
                    status=404
                )

        grupo = user.groups.first()

        timezone = pytz.timezone('America/Costa_Rica')

        return JsonResponse({
            'id': user.username,
            'email': user.email,
            'fecha_creacion': str(user.date_joined.astimezone(timezone).strftime("%d/%m/%Y %H:%M:%S")),
            'fecha_ingreso': str(user.last_login.astimezone(timezone).strftime("%d/%m/%Y %H:%M:%S")),
            'activo': user.activo if hasattr(user, 'activo') else user.is_active,
            'grupo': grupo.name if grupo else None,
        })

    except User.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

class DashboardAdministrativoView(LoginRequiredMixin, View):
    context_object_name = 'inicioAdministrativo'

    def get(self, *args, **kwargs):
        user = self.request.user
        type = kwargs.get('type')
        id = kwargs.get('id')
        context = {
            'type': type,
            'id': user.username
        }
        if type == "administrador" and id == 'mercadeo':
            context['fotoNoticia'] = ImagenNoticias.mostrarFotosNoticias('')
            context['Noticias'] = Noticias.mostrarNoticias('')
            return render(self.request, 'Dashboard/Administrativo/Mercadeo/mercadeo.html', context)
        elif type == "administrador" and id == 'soporte':
            return render(self.request, 'Dashboard/Administrativo/Soporte/soporte.html', context)
        elif type == "administrador":
            return render(self.request, 'Dashboard/Administrativo/Soporte/soporte.html', context)


class ImagenNoticias(LoginRequiredMixin, View):

    def guardarImagenNoticia(request):
        imgnueva = request.FILES.get('imagen')
        fechaI = request.POST.get('fechaI')
        horaI = request.POST.get('horaI')
        fechaF = request.POST.get('fechaF')
        horaF = request.POST.get('horaF')
        tipo = request.POST.get('tipo')
        tipoE = request.POST.get('tipoE')
        tipoP = request.POST.get('tipoP')
        tipoD = request.POST.get('tipoD')
        tipoE = tipoE.lower() == 'true'
        tipoP = tipoP.lower() == 'true'
        tipoD = tipoD.lower() == 'true'
        user = request.user

        if request.method == 'POST':
            try:
                if imgnueva is not None:
                    img_data = imgnueva.read()
                    img_bytes = bytearray(img_data)
                    nombre_archivo = imgnueva.name
                    fotoNoticia = imagenNoticia(imagen=img_bytes, imagen_nombre=nombre_archivo, estudiante=tipoE,
                                                profesor=tipoP, fecha_inicio=fechaI, fecha_fin=fechaF,
                                                hora_inicio=horaI, hora_fin=horaF, destacada=tipoD)
                    fotoNoticia.save()
                    registrar_accion(user,
                                     'El usuario {0} ha guardado una imagen de noticia para {1}'.format(user.username,
                                                                                                        tipo))
                return JsonResponse({'success': True})
            except Exception as e:
                return JsonResponse({'error': str(e)})

    def mostrarFotosNoticias(id):
        if id == 'estudiante':
            fotos = imagenNoticia.objects.filter(estudiante=True)
        elif id == 'profesor':
            fotos = imagenNoticia.objects.filter(profesor=True)
        else:
            fotos = imagenNoticia.objects.all()
        imagenes = []
        for foto in fotos:
            fechaI_formateada = foto.fecha_inicio.strftime("%Y-%m-%d")
            fechaF_formateada = foto.fecha_fin.strftime("%Y-%m-%d")
            hora_inicio_formateada = foto.hora_inicio.strftime("%H:%M")
            hora_fin_formateada = foto.hora_fin.strftime("%H:%M")

            imagen_dict = {
                'id': foto.id,
                'imagen': base64.b64encode(bytes(foto.imagen)).decode('utf-8'),
                'imagen_nombre': foto.imagen_nombre,
                'fecha_inicio': fechaI_formateada,
                'fecha_fin': fechaF_formateada,
                'hora_inicio': hora_inicio_formateada,
                'hora_fin': hora_fin_formateada,
                'estudiante': foto.estudiante,
                'profesor': foto.profesor,
                'destacada': foto.destacada,
            }
            imagenes.append(imagen_dict)
        return imagenes

    def mostrarFotosNoticiasU(request, id):
        ajax = request.GET.get("flag")
        context = {}
        fotosAux = request.session.get('publicidad')
        if fotosAux is None or len(fotosAux) == 0:
            if id == 'estudiante':
                fotos = imagenNoticia.objects.filter(estudiante=True)
            elif id == 'profesor':
                fotos = imagenNoticia.objects.filter(profesor=True)

        else:
            eventos_seleccionadosE = []
            eventos_seleccionadosD = []
            if ajax is None:
                ajax = False
            if ajax and id == 'estudiante':
                status = 302
                return JsonResponse(context, status=status, safe=False)
            elif ajax and id == 'profesor':
                status = 302
                return JsonResponse(context, status=status, safe=False)
            else:
                result_eventos_seleccionados, result_eventos_seleccionadosD = filtro(request, 'publicidad')
                for evento in result_eventos_seleccionados:
                    eventos_seleccionadosE.append(evento)
                for eventoD in result_eventos_seleccionadosD:
                    eventos_seleccionadosD.append(eventoD)
                return eventos_seleccionadosE, eventos_seleccionadosD
        imagenes = []
        imagenesDes = []
        for foto in fotos:
            fechaI_formateada = foto.fecha_inicio.strftime("%Y-%m-%d")
            fechaF_formateada = foto.fecha_fin.strftime("%Y-%m-%d")
            hora_inicio_formateada = foto.hora_inicio.strftime("%H:%M")
            hora_fin_formateada = foto.hora_fin.strftime("%H:%M")
            if not foto.destacada:
                imagen_dict = {
                    'id': foto.id,
                    'imagen': base64.b64encode(bytes(foto.imagen)).decode('utf-8'),
                    'imagen_nombre': foto.imagen_nombre,
                    'fecha_inicio': fechaI_formateada,
                    'fecha_fin': fechaF_formateada,
                    'hora_inicio': hora_inicio_formateada,
                    'hora_fin': hora_fin_formateada,
                    'estudiante': foto.estudiante,
                    'profesor': foto.profesor,
                    'destacada': foto.destacada,
                }
                imagenes.append(imagen_dict)
            else:
                imagen_dictD = {
                    'id': foto.id,
                    'imagen': base64.b64encode(bytes(foto.imagen)).decode('utf-8'),
                    'imagen_nombre': foto.imagen_nombre,
                    'fecha_inicio': fechaI_formateada,
                    'fecha_fin': fechaF_formateada,
                    'hora_inicio': hora_inicio_formateada,
                    'hora_fin': hora_fin_formateada,
                    'estudiante': foto.estudiante,
                    'destacada': foto.destacada,
                }
                imagenesDes.append(imagen_dictD)

        eventos_seleccionados = []
        eventos_seleccionadosD = []

        request.session['publicidad'] = imagenes
        if imagenesDes:
            request.session['publicidadDe'] = imagenesDes
        result_eventos_seleccionados, result_eventos_seleccionadosD = filtro(request, 'publicidad')

        for evento in result_eventos_seleccionados:
            eventos_seleccionados.append(evento)
        for eventoD in result_eventos_seleccionadosD:
            eventos_seleccionadosD.append(eventoD)
        if ajax is None:
            ajax = False
        if ajax and id == 'estudiante':
            context['imagenes_estudiante'] = eventos_seleccionados
            context['imagenes_estudianteD1'] = eventos_seleccionadosD[1][0]
            context['imagenes_estudianteD2'] = eventos_seleccionadosD[1][1]
            return JsonResponse(context, safe=False)
        elif ajax and id == 'profesor':
            context['imagenes_profesor'] = eventos_seleccionados
            context['imagenes_estudianteD1'] = eventos_seleccionadosD[1][0]
            context['imagenes_estudianteD2'] = eventos_seleccionadosD[1][1]
            return JsonResponse(context, safe=False)
        else:
            if eventos_seleccionados and eventos_seleccionadosD:
                return eventos_seleccionados, eventos_seleccionadosD
            elif eventos_seleccionados:
                return eventos_seleccionados,
            elif eventos_seleccionadosD:
                return eventos_seleccionadosD,

    def borrarFotosNoticias(request):
        user = request.user
        if request.method == 'POST':
            try:
                id = request.POST.get("id")
                imagen_noticia = imagenNoticia.objects.get(id=id)
                registrar_accion(user, 'El usuario {0} ha borrado una imagen de noticia'.format(user.username))
                imagen_noticia.delete()
                return JsonResponse({'success': True})
            except imagenNoticia.DoesNotExist:
                return JsonResponse({'success': False})
            except Exception as e:
                return JsonResponse({'error': str(e)})

    def mostrarFotosNoticiasId(request):
        if request.method == 'GET':
            try:
                id = request.GET.get("id")
                imagen_noticia = imagenNoticia.objects.get(id=id)
                imagenes = []
                imagen_dict = {
                    'id': imagen_noticia.id,
                    'imagen': base64.b64encode(bytes(imagen_noticia.imagen)).decode('utf-8'),
                    'imagen_nombre': imagen_noticia.imagen_nombre,
                    'fecha_inicio': imagen_noticia.fecha_inicio,
                    'fecha_fin': imagen_noticia.fecha_fin,
                    'hora_inicio': imagen_noticia.hora_inicio,
                    'hora_fin': imagen_noticia.hora_fin,
                    'estudiante': imagen_noticia.estudiante,
                    'profesor': imagen_noticia.profesor,
                    'destacada': imagen_noticia.destacada,
                }
                imagenes.append(imagen_dict)
                context = {'fotoNoticia': imagenes}
                return JsonResponse(context, safe=False)
            except imagenNoticia.DoesNotExist:
                return JsonResponse({'error': 'La imagen de noticia no existe.'})
            except Exception as e:
                return JsonResponse({'error': str(e)})

    def actualizarFotosNoticias(request):
        imgnueva = request.FILES.get('imagen')
        user = request.user
        fechaI = request.POST.get('fechaI')
        horaI = request.POST.get('horaI')
        fechaF = request.POST.get('fechaF')
        horaF = request.POST.get('horaF')
        tipo = request.POST.get('tipo')
        tipoE = request.POST.get('tipoE')
        tipoP = request.POST.get('tipoP')
        tipoD = request.POST.get('tipoD')
        tipoE = tipoE.lower() == 'true'
        tipoP = tipoP.lower() == 'true'
        tipoD = tipoD.lower() == 'true'
        if request.method == 'POST':
            try:
                id = request.POST.get("id")
                imagen_noticia = imagenNoticia.objects.get(id=id)
                if imgnueva is not None:
                    img_data = imgnueva.read()
                    img_bytes = bytearray(img_data)
                    nombre_archivo = imgnueva.name
                    imagen_noticia.imagen = img_bytes
                    imagen_noticia.imagen_nombre = nombre_archivo
                    imagen_noticia.estudiante = tipoE
                    imagen_noticia.profesor = tipoP
                    imagen_noticia.destacada = tipoD
                    imagen_noticia.fecha_inicio = fechaI
                    imagen_noticia.fecha_fin = fechaF
                    imagen_noticia.hora_inicio = horaI
                    imagen_noticia.hora_fin = horaF
                    imagen_noticia.save()
                    registrar_accion(user, 'El usuario {0} ha actualizado una imagen de noticia para {1}'.format(
                        user.username, tipo))
                    return JsonResponse({'success': True})
                else:
                    imagen_noticia.estudiante = tipoE
                    imagen_noticia.profesor = tipoP
                    imagen_noticia.destacada = tipoD
                    imagen_noticia.fecha_inicio = fechaI
                    imagen_noticia.fecha_fin = fechaF
                    imagen_noticia.hora_inicio = horaI
                    imagen_noticia.hora_fin = horaF
                    imagen_noticia.save()
                    registrar_accion(user, 'El usuario {0} ha actualizado una imagen de noticia para {1}'.format(
                        user.username, tipo))
                    return JsonResponse({'success': True})
            except Exception as e:
                return JsonResponse({'success': False})


class Noticias(LoginRequiredMixin, View):

    def guardarNoticia(request):
        imgnueva = request.FILES.get('imagen')
        tituloN = request.POST.get('titulo')
        descripcionN = request.POST.get('descripcion')
        fechaI = request.POST.get('fechaI')
        horaI = request.POST.get('horaI')
        fechaF = request.POST.get('fechaF')
        horaF = request.POST.get('horaF')
        tipo = request.POST.get('tipo')
        tipoE = request.POST.get('tipoE')
        tipoP = request.POST.get('tipoP')
        tipoE = tipoE.lower() == 'true'
        tipoP = tipoP.lower() == 'true'
        user = request.user
        if request.method == 'POST':
            try:
                if imgnueva is not None:
                    img_data = imgnueva.read()
                    img_bytes = bytearray(img_data)
                    nombre_archivo = imgnueva.name
                    noticia = noticias(imagen=img_bytes, imagen_nombre=nombre_archivo, titulo=tituloN,
                                       descripcion=descripcionN, estudiante=tipoE, profesor=tipoP, fecha_inicio=fechaI,
                                       fecha_fin=fechaF, hora_inicio=horaI, hora_fin=horaF)
                    noticia.save()
                    registrar_accion(user,
                                     'El usuario {0} ha guardado una noticia para {1}'.format(user.username, tipo))
                return JsonResponse({'success': True})
            except Exception as e:
                return JsonResponse({'error': str(e)})

    def mostrarNoticias(id):
        if id == 'estudiante':
            noticiaList = noticias.objects.filter(estudiante=True)
        elif id == 'profesor':
            noticiaList = noticias.objects.filter(profesor=True)
        else:
            noticiaList = noticias.objects.all()
        noticiasList = []
        for noticia in noticiaList:
            fechaI_formateada = noticia.fecha_inicio.strftime("%Y-%m-%d")
            fechaF_formateada = noticia.fecha_fin.strftime("%Y-%m-%d")
            hora_inicio_formateada = noticia.hora_inicio.strftime("%H:%M")
            hora_fin_formateada = noticia.hora_fin.strftime("%H:%M")
            noticia_dict = {
                'id': noticia.id,
                'imagen': base64.b64encode(bytes(noticia.imagen)).decode('utf-8'),
                'imagen_nombre': noticia.imagen_nombre,
                'titulo': noticia.titulo,
                'descripcion': noticia.descripcion,
                'fecha_inicio': fechaI_formateada,
                'fecha_fin': fechaF_formateada,
                'hora_inicio': hora_inicio_formateada,
                'hora_fin': hora_fin_formateada,
                'estudiante': noticia.estudiante,
                'profesor': noticia.profesor,
            }
            noticiasList.append(noticia_dict)
        return noticiasList

    def mostrarNoticiasU(request, id):
        ajax = request.GET.get("flag")
        context = {}
        fotosAux = request.session.get('noticia')
        if fotosAux is None or len(fotosAux) == 0:
            if id == 'estudiante':
                noticiaList = noticias.objects.filter(estudiante=True)
            elif id == 'profesor':
                noticiaList = noticias.objects.filter(profesor=True)
        else:
            eventos_seleccionadosN = []
            result_eventos_seleccionados, result_eventos_seleccionadosD = filtro(request, 'noticia')
            if ajax is None:
                ajax = False
            if ajax and id == 'estudiante':
                for evento in result_eventos_seleccionados:
                    eventos_seleccionadosN.append(evento)
                context['noticia_estudiante'] = eventos_seleccionadosN
                return JsonResponse(context, safe=False)
            elif ajax and id == 'profesor':
                for evento in result_eventos_seleccionados:
                    eventos_seleccionadosN.append(evento)
                context['noticia_profesor'] = eventos_seleccionadosN
                return JsonResponse(context, safe=False)
            else:
                for evento in result_eventos_seleccionados:
                    eventos_seleccionadosN.append(evento)
                return eventos_seleccionadosN

        noticiasList = []
        for noticia in noticiaList:
            fechaI_formateada = noticia.fecha_inicio.strftime("%Y-%m-%d")
            fechaF_formateada = noticia.fecha_fin.strftime("%Y-%m-%d")
            hora_inicio_formateada = noticia.hora_inicio.strftime("%H:%M")
            hora_fin_formateada = noticia.hora_fin.strftime("%H:%M")
            noticia_dict = {
                'id': noticia.id,
                'imagen': base64.b64encode(bytes(noticia.imagen)).decode('utf-8'),
                'imagen_nombre': noticia.imagen_nombre,
                'titulo': noticia.titulo,
                'descripcion': noticia.descripcion,
                'fecha_inicio': fechaI_formateada,
                'fecha_fin': fechaF_formateada,
                'hora_inicio': hora_inicio_formateada,
                'hora_fin': hora_fin_formateada,
                'estudiante': noticia.estudiante,
                'profesor': noticia.profesor,
            }
            noticiasList.append(noticia_dict)
        eventos_seleccionadosN = []
        request.session['noticia'] = noticiasList
        result_eventos_seleccionados, result_eventos_seleccionadosD = filtro(request, 'noticia')
        for evento in result_eventos_seleccionados:
            eventos_seleccionadosN.append(evento)

        if ajax is None:
            ajax = False
        if ajax and id == 'estudiante':
            context['noticia_estudiante'] = eventos_seleccionadosN
            return JsonResponse(context, safe=False)
        elif ajax and id == 'profesor':
            context['noticia_profesor'] = eventos_seleccionadosN
            return JsonResponse(context, safe=False)
        else:
            return eventos_seleccionadosN

    def borrarNoticias(request):
        user = request.user
        if request.method == 'POST':
            try:
                id = request.POST.get("id")
                noticia = noticias.objects.get(id=id)
                registrar_accion(user, 'El usuario {0} ha borrado una noticia'.format(user.username))
                noticia.delete()
                return JsonResponse({'success': True})
            except imagenNoticia.DoesNotExist:
                return JsonResponse({'success': False})
            except Exception as e:
                return JsonResponse({'error': str(e)})

    def mostrarNoticiasId(request):
        if request.method == 'GET':
            try:
                id = request.GET.get("id")
                noticia = noticias.objects.get(id=id)
                noticiasList = []
                noticia_dict = {
                    'id': noticia.id,
                    'imagen': base64.b64encode(bytes(noticia.imagen)).decode('utf-8'),
                    'imagen_nombre': noticia.imagen_nombre,
                    'titulo': noticia.titulo,
                    'descripcion': noticia.descripcion,
                    'fecha_inicio': noticia.fecha_inicio,
                    'fecha_fin': noticia.fecha_fin,
                    'hora_inicio': noticia.hora_inicio,
                    'hora_fin': noticia.hora_fin,
                    'estudiante': noticia.estudiante,
                    'profesor': noticia.profesor,
                }
                noticiasList.append(noticia_dict)
                context = {'Noticias': noticiasList}
                return JsonResponse(context, safe=False)
            except imagenNoticia.DoesNotExist:
                return JsonResponse({'error': 'La noticia no existe.'})
            except Exception as e:
                return JsonResponse({'error': str(e)})

    def actualizarNoticias(request):
        imgnueva = request.FILES.get('imagen')
        tituloN = request.POST.get('titulo')
        descripcionN = request.POST.get('descripcion')
        fechaI = request.POST.get('fechaI')
        horaI = request.POST.get('horaI')
        fechaF = request.POST.get('fechaF')
        horaF = request.POST.get('horaF')
        tipo = request.POST.get('tipo')
        tipoE = request.POST.get('tipoE')
        tipoP = request.POST.get('tipoP')
        tipoE = tipoE.lower() == 'true'
        tipoP = tipoP.lower() == 'true'
        user = request.user
        if request.method == 'POST':
            try:
                id = request.POST.get("id")
                noticia = noticias.objects.get(id=id)
                if imgnueva is not None:
                    img_data = imgnueva.read()
                    img_bytes = bytearray(img_data)
                    nombre_archivo = imgnueva.name
                    noticia.imagen = img_bytes
                    noticia.imagen_nombre = nombre_archivo
                    noticia.titulo = tituloN
                    noticia.descripcion = descripcionN
                    noticia.estudiante = tipoE
                    noticia.profesor = tipoP
                    noticia.fecha_inicio = fechaI
                    noticia.fecha_fin = fechaF
                    noticia.hora_inicio = horaI
                    noticia.hora_fin = horaF
                    noticia.save()
                    registrar_accion(user,
                                     'El usuario {0} ha actualizado una noticia para {1}'.format(user.username, tipo))
                    return JsonResponse({'success': True})
                else:
                    noticia.titulo = tituloN
                    noticia.descripcion = descripcionN
                    noticia.estudiante = tipoE
                    noticia.profesor = tipoP
                    noticia.fecha_inicio = fechaI
                    noticia.fecha_fin = fechaF
                    noticia.hora_inicio = horaI
                    noticia.hora_fin = horaF
                    noticia.save()
                    registrar_accion(user,
                                     'El usuario {0} ha actualizado una noticia para {1}'.format(user.username, tipo))
                    return JsonResponse({'success': True})
            except Exception as e:
                return JsonResponse({'success': False})


def filtro(request, id):
    eventos_seleccionados = []
    eventos_seleccionadosD = []
    fecha_actual = datetime.date.today()
    hora_actual = datetime.datetime.now().time()
    dataD = False
    if id == 'publicidad':
        data = request.session.get('publicidad')
        dataD = request.session.get('publicidadDe')
    elif id == 'noticia':
        data = request.session.get('noticia')
    for evento in data:
        fecha_inicio = datetime.datetime.strptime(evento['fecha_inicio'], '%Y-%m-%d').date()
        hora_inicio = datetime.datetime.strptime(evento['hora_inicio'], '%H:%M').time()
        fecha_fin = datetime.datetime.strptime(evento['fecha_fin'], '%Y-%m-%d').date()
        hora_fin = datetime.datetime.strptime(evento['hora_fin'], '%H:%M').time()

        inicio_evento = datetime.datetime.combine(fecha_inicio, hora_inicio)
        fin_evento = datetime.datetime.combine(fecha_fin, hora_fin)
        actual = datetime.datetime.combine(fecha_actual, hora_actual)
        if 'destacada' in evento:
            if (inicio_evento <= actual <= fin_evento) and not evento['destacada']:
                eventos_seleccionados.append(evento)
        else:
            if (inicio_evento <= actual <= fin_evento):
                eventos_seleccionados.append(evento)
    if dataD:
        for eventoD in dataD:
            fecha_inicio = datetime.datetime.strptime(eventoD['fecha_inicio'], '%Y-%m-%d').date()
            hora_inicio = datetime.datetime.strptime(eventoD['hora_inicio'], '%H:%M').time()
            fecha_fin = datetime.datetime.strptime(eventoD['fecha_fin'], '%Y-%m-%d').date()
            hora_fin = datetime.datetime.strptime(eventoD['hora_fin'], '%H:%M').time()

            inicio_evento = datetime.datetime.combine(fecha_inicio, hora_inicio)
            fin_evento = datetime.datetime.combine(fecha_fin, hora_fin)
            actual = datetime.datetime.combine(fecha_actual, hora_actual)

            if (inicio_evento <= actual <= fin_evento) and eventoD['destacada']:
                eventos_seleccionadosD.append(eventoD)

    return eventos_seleccionados, eventos_seleccionadosD


def userGroup(name):
    try:
        group = Group.objects.get(name=name)
        users = group.user_set.all()
        usuariosR = []
        for usuario in users:
            user = {
                'id': usuario.username,
                'email': usuario.email,
                'fecha_creacion': usuario.date_joined.strftime("%d/%m/%Y"),
                'fecha_ingreso': usuario.last_login.strftime("%d/%m/%Y"),
                'activo': usuario.is_active,
            }
            usuariosR.append(user)
    except Group.DoesNotExist:
        usuariosR = []
    return usuariosR


def historialAccion():
    try:
        historial = RegistroLogsUser.objects.all()
        historialList = []
        for h in historial:
            usuario_email = ''
            if h.usuario.email:
                usuario_email = h.usuario.email
            else:
                usuario_email = h.usuario
            timezone = pytz.timezone('America/Costa_Rica')
            fecha_local = h.fechatiempo.astimezone(timezone)
            historiaAux = {
                'usuario': usuario_email,
                'accion': h.accion,
                'fecha': fecha_local.strftime("%d/%m/%Y %H:%M:%S")
            }
            historialList.append(historiaAux)
    except RegistroLogsUser.DoesNotExist:
        historialList = []
    return historialList


class Soporte(LoginRequiredMixin, View):

    def getPlan(request, type, user):
        userAux = User.objects.get(username=user)
        request.session['usuarioIns'] = userAux.username
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_planes_estudio'
        idEstudiante = json.dumps({'identificacion': str(user)})
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.request("GET", url, headers=headers, data=idEstudiante)
        # response = requests.request("GET", url)
        data = json.loads(response.text)['result']
        context = {

        }
        if type == 'estudiante':
            context['carrera'] = data
            context['type'] = type
        else:
            context['type'] = type
        return render(request, 'Dashboard/Administrativo/Soporte/inspeccionarUsuario.html', context)

    def misCursos(request, type, user):
        userAux = User.objects.get(username=user)
        request.session['usuarioIns'] = userAux.username
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_cursos_estudiante'
        idProfesor = json.dumps({'identificacion': str(user)})
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.request("GET", url, headers=headers, data=idProfesor)
        data = json.loads(response.text)['result']
        dataP = []
        context = {

        }
        for curso in data['data']['periodos']:
            dataP.append(curso)

        request.session['HorariosE'] = data
        if type == 'estudiante':
            context['misCursos'] = dataP
            context['type'] = type
        else:
            context['type'] = type
        return render(request, 'Dashboard/Administrativo/Soporte/misCursosS.html', context)

    def horarios(request, type, user):
        userAux = User.objects.get(username=user)
        request.session['usuarioIns'] = userAux.username
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_cursos_estudiante'
        idProfesor = json.dumps({'identificacion': str(user)})
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.request("GET", url, headers=headers, data=idProfesor)
        data = json.loads(response.text)['result']
        dataP = []
        for curso in data['data']['periodos']:
            dataP.append(curso)

        request.session['HorariosE'] = data

        context = {
            'misCursos': dataP,
            'type': type,
        }

        return render(request, 'Dashboard/Administrativo/Soporte/horarioS.html', context)

    def estadoCuenta(request, type, user):
        url = 'https://mocki.io/v1/0e843b73-8f53-4cf1-a191-b625e0512253'

        response = requests.request("GET", url)
        data = json.loads(response.text)['result']
        context = {

        }
        if type == 'Estudiante':
            context['financiamiento'] = data
            context['type'] = type
        else:
            context['type'] = type
        return render(request, 'Dashboard/Administrativo/Soporte/estadoCuenta.html', context)

    def perfil(request, type, user):
        user = request.user
        context = {
            'user': user,
        }
        if type == 'Estudiante':
            context['perfil'] = get_student(id)
            context['type'] = type
        elif type == 'Profesor':
            context['perfil'] = get_professor(id)
            context['type'] = type
        else:
            perfil = get_object_or_404(prospecto, identificacion=id)
            context['perfil'] = perfil
            context['type'] = type
        return render(request, 'Dashboard/Administrativo/Soporte/perfil.html', context)

    def correo(request, type):
        context = {
            'type': type,
        }
        return render(request, 'Dashboard/Administrativo/Soporte/correo.html', context)

    def actODesac(request):
        user = request.user
        if request.method == 'POST':
            email = request.POST.get("email")
            active = request.POST.get("active") == 'true'
            try:
                userAux = User.objects.get(email=email)
                userAux.is_active = active
                userAux.save()
                registrar_accion(user,
                                 'El usuario {0} ha actualizado el valor activo del correo: {1}'.format(user.username,
                                                                                                        email))
                return JsonResponse({'success': True})
            except User.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Usuario no encontrado'})
            except Exception as e:
                return JsonResponse({'success': False, 'message': str(e)})
        return JsonResponse({'success': False, 'message': 'Solicitud no válida'})

    def misCursosP(request, type, user):
        userAux = User.objects.get(username=user)
        request.session['usuarioIns'] = userAux.username
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_docente_periodos'
        idProfesor = json.dumps({'identificacion': str(user)})
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.request("POST", url, headers=headers, data=idProfesor)

        data = json.loads(response.text)['result']
        dataP = []
        for curso in data['data']['periodos']:
            dataP.append(curso['periodo'])
        request.session['misCursoP'] = data
        context = {
            'user': user,
            'misCursos': dataP,
            'type': type,
            'formulario': request.session.get('formulario', 'NA'),
        }
        return render(request, 'Dashboard/Administrativo/Soporte/profeAdmin.html', context)


def get_connected_users():
    return User.objects.filter(is_active=True, last_login__gte=timezone.now() - timedelta(minutes=15))


def get_connected_users_count():
    return User.objects.filter(is_active=True, last_login__gte=timezone.now() - timedelta(minutes=15)).count()
