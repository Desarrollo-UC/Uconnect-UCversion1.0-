from django.shortcuts import render, redirect, get_object_or_404
import concurrent.futures
# from openai import Image
from usuario.files_manager import files_manager
from .administrativo import ImagenNoticias, Noticias
from .payment import obtener_keyiD, obtener_hash_entrada
from .models import *
from .forms import CustomUserCreationForm
from django.views.generic.edit import FormView
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from django.http import Http404, JsonResponse, HttpResponse, HttpResponseRedirect
from django.contrib.auth.models import User
from django.contrib.auth.models import Group as GroupM
import requests
from django.views import View
from django.conf import settings
from django.urls import reverse
from .backends import MicrosoftGraphBackend
from .dspace_processes import dspace_processes
from .save_processes import save_profile_processes, saveInGroup
from .api_queries import *
import json
import base64
from datetime import date
import re
import base64
from .envioCorreo import Correo
from django.contrib.auth.forms import PasswordResetForm
from django.template.loader import render_to_string
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
import urllib.parse
from urllib.parse import urlencode
from xhtml2pdf import pisa
import logging
logger = logging.getLogger(__name__)

def error_500_view(request):
    path = request.path.lower()

    es_inspeccion = (
        'inspeccionarprofe' in path or
        'inspeccionar' in path or
        'inspeccionarusuario' in path
    )

    if es_inspeccion:
        return render(
            request,
            '500_soporte.html',
            {
                'traceback': getattr(request, 'traceback', 'Traceback no disponible'),
                'usuario_soporte': request.user.username,
                'usuario_inspeccionado': request.session.get('usuarioIns'),
                'path': request.path,
            },
            status=500
        )

    return render(request, '500.html', status=500)


class Logueo(LoginView):
    template_name = 'Usuario/login.html'
    fields = '__all__'
    redirect_authenticated_user = True

    def get_context_data(self, **kwargs):
        logout(self.request)
        context = super().get_context_data(**kwargs)
        context['cuenta'] = self.request.GET.get('cuenta')
        return context

    def form_valid(self, form):
        logout(self.request)
        user = form.cleaned_data['username']
        password = form.cleaned_data['password']
        user = authenticate(self.request, username=user, password=password)
        context = {}
        if user is not None:
            group = GroupM.objects.get(name='Prospecto')
            groupAdmin = GroupM.objects.get(name='Administracion')
            goupDocente = GroupM.objects.get(name='Docente')
            goupEstudiante = GroupM.objects.get(name='Estudiante')
            if user.is_active and user in group.user_set.all():
                login_user_info = prospecto.objects.get(identificacion=user.username)
                prospecto_dict = {field: str(getattr(login_user_info, field)) for field in
                                  ['id_prospecto', 'identificacion', 'tipo_identificacion', 'estado_migratorio',
                                   'nombre', 'primer_apellido', 'segundo_apellido', 'fecha_nacimiento',
                                   'numero_telefonico', 'numero_telefonico2', 'correo_institucional', 'correo_personal',
                                   'nacionalidad', 'provincia', 'canton', 'distrito', 'direccion_exacta', 'sexo']}
                prospecto_dict['tipo'] = 'prospecto'
                self.request.session['user_info'] = prospecto_dict
                login(self.request, user)
                registrar_accion(user, 'El usuario {0} ha ingresado como prospecto.'.format(user.username))
                context = {'type': 'prospecto'}
                return redirect(reverse('inicio', kwargs=context))
            elif user.is_active and user in groupAdmin.user_set.all():
                login(self.request, user)
                context = {'type': 'administrador', 'id': user.username}
                return redirect('inicioAdministrativo', **context)
            elif user.is_active and user in goupDocente.user_set.all():
                try:
                    profesor_usuario = get_professor(user.username)
                    userMoodle = moodleUser.objects.get(identificacion=user.username)
                    if userMoodle.act_datos == False and (
                            profesor_usuario["correo_institucional"] == None or profesor_usuario[
                        "correo_institucional"] == False or profesor_usuario["correo_institucional"] == 'N/A'):
                        profesor_usuario["tipo"] = "profesor"
                        self.request.session['user_info'] = profesor_usuario
                        login(self.request, user)
                        registrar_accion(user, 'El usuario {0} ha ingresado como docente.'.format(user.username))
                        context = {'type': 'profesor'}
                        return redirect(reverse('perfil_temp', kwargs=context))
                    elif '@edu.uia.ac.cr' in profesor_usuario["correo_institucional"] or '@uia.ac.cr' in \
                            profesor_usuario["correo_institucional"]:
                        form.add_error('username',
                                       'El usuario ingresado ya posee correo institucional. Por favor, utilizar las credenciales del correo institucional para ingresar a la plataforma. Gracias.')
                        logout(self.request)
                        return render(self.request, 'Usuario/login.html', {'form': form})
                except:
                    form.add_error('username',
                                   'El usuario ingresado posee un problema de ingreso. Por favor, ponte en contacto con el equipo de soporte técnico, soporte_tecnico@uia.ac.cr. Gracias.')
                    logout(self.request)
                    return render(self.request, 'Usuario/login.html', {'form': form})
            elif user.is_active and user in goupEstudiante.user_set.all():
                try:
                    estudiante_usuario = get_student(user.username)
                    userMoodle = moodleUser.objects.get(identificacion=user.username)
                    if userMoodle.act_datos == False and (
                            estudiante_usuario["correo_institucional"] == None or estudiante_usuario[
                        "correo_institucional"] == False or estudiante_usuario["correo_institucional"] == 'N/A'):
                        estudiante_usuario["tipo"] = "estudiante"
                        self.request.session['user_info'] = estudiante_usuario
                        login(self.request, user)
                        registrar_accion(user, 'El usuario {0} ha ingresado como estudiante.'.format(user.username))
                        context = {'type': 'estudiante'}
                        return redirect(reverse('perfil_temp', kwargs=context))
                    elif '@edu.uia.ac.cr' in estudiante_usuario["correo_institucional"] or '@uia.ac.cr' in \
                            estudiante_usuario["correo_institucional"]:
                        form.add_error('username',
                                       'El usuario ingresado ya posee correo institucional. Por favor, utilizar las credenciales del correo institucional para ingresar a la plataforma. Gracias.')
                        logout(self.request)
                        return render(self.request, 'Usuario/login.html', {'form': form})
                except:
                    form.add_error('username',
                                   'El usuario ingresado ya posee un problema de ingreso. Por favor, ponte en contacto con el equipo de soporte técnico, soporte_tecnico@uia.ac.cr. Gracias.')
                    logout(self.request)
                    return render(self.request, 'Usuario/login.html', {'form': form})
            else:
                logout(self.request)
                return reverse('inicio')
        else:
            form.add_error('username', 'El usuario no existe en el sistema')
            logout(self.request)
            return render(self.request, 'Usuario/login.html', {'form': form})


class CustomLogoutView(View):
    def get(self, request, *args, **kwargs):
        logout(request)
        return HttpResponseRedirect('/')

    def post(self, request, *args, **kwargs):
        return self.get(request, *args, **kwargs)


def is_user_in_group(user, group_name):
    try:
        group = GroupM.objects.get(name=group_name)
        return user in group.user_set.all()
    except GroupM.DoesNotExist:
        return False


def redirect_user_by_role(user, primer_inicio, isWebView, morosidaD, morosidaF):
    if is_user_in_group(user, 'Estudiante'):
        status = get_object_or_404(user_status, identificacion=user.username)
        if not status.moroso:
            registrar_accion(user, f"El usuario {user.username} ha ingresado como estudiante.")
            context = {'type': 'estudiante'}
            if not primer_inicio:
                print(f"Redirigiendo a: {reverse('inicio', kwargs=context)}")

                return redirect(reverse('mobile' if isWebView else 'inicio', kwargs=context))
            return redirect(reverse('perfil', kwargs=context))
        else:
            registrar_accion(user, f"El usuario {user.username} ha ingresado como estudiante. Status: moroso.")
            context = {'type': 'estudiante'}
            if morosidaD and morosidaF is not True:
                return redirect(reverse('inicio', kwargs=context))
            return redirect(reverse('estadoCuentaEstudiante', kwargs=context))
    elif is_user_in_group(user, 'Docente'):
        registrar_accion(user, f"El usuario {user.username} ha ingresado como profesor.")
        context = {'type': 'profesor'}
        return redirect(reverse('perfil' if primer_inicio else 'inicio', kwargs=context))
    elif is_user_in_group(user, 'Docente y Estudiante'):
        registrar_accion(user, f"El usuario {user.username} ha ingresado como estudiante/profesor.")
        context = {'type': 'profesor-estudiante'}
        return redirect(reverse('perfil' if primer_inicio else 'inicio', kwargs=context))
    return redirect('login')


def get_microsoft_auth_url():
    redirect_uri = settings.MICROSOFT_AUTH_REDIRECT_URI
    return {
        'client_id': settings.MICROSOFT_CLIENT_ID,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': 'openid email profile',
        'response_mode': 'query',
        'prompt': 'login'
    }


def microsoft_auth(request):
    if 'access_token' in request.session:
        access_token = request.session['access_token']
        bearer = f"Bearer {access_token}"
        response = requests.get("https://graph.microsoft.com/v1.0/me", headers={'Authorization': bearer})
        if response.status_code == 200:
            user = MicrosoftGraphBackend.authenticate(request=request, access_token=access_token)
            if user is not None and user.is_active:
                request.session['moroso'] = False
                primer_inicio = False  # Asume algún método para obtener este valor
                isWebView = request.session.get('isWebView', False)
                login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                if user['tipo'] == 'Estudiante' or user['tipo'] == 'Docente y Estudiante':
                    user_status_update(request)
                morosidad = request.session.get('documentos')
                morosidaF = request.session.get('financiero')
                return redirect_user_by_role(user, primer_inicio, isWebView, morosidad, morosidaF)
        del request.session['access_token']
        return redirect('login')

    params = get_microsoft_auth_url()
    auth_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
    return redirect(f"{auth_url}?{urlencode(params)}")


def microsoft_callback(request):
    auth_code = request.GET.get('code')
    redirect_uri = settings.MICROSOFT_AUTH_REDIRECT_URI
    token_data = {
        'grant_type': 'authorization_code',
        'code': auth_code,
        'redirect_uri': redirect_uri,
        'client_id': settings.MICROSOFT_CLIENT_ID,
        'client_secret': settings.MICROSOFT_CLIENT_SECRET,
        'scope': 'openid email profile',
    }

    token_response = requests.post(
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        data=token_data,
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )

    if token_response.status_code == 200:
        tokens = token_response.json()
        request.session['access_token'] = tokens['access_token']
        user_auth = MicrosoftGraphBackend.authenticate(request=request, access_token=tokens['access_token'])
        user = user_auth['user']
        if user is not None and user.is_active:
            primer_inicio = user_auth['primer_inicio']
            isWebView = request.session.get('isWebView', False)
            print(f"Usuario autenticado: {request.user.is_authenticated}")
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            if user_auth['tipo'] == 'Estudiante' or user_auth['tipo'] == 'Docente y Estudiante':
                user_status_update(request)
            morosidad = request.session.get('documentos')
            morosidaF = request.session.get('financiero')
            print(f"Usuario autenticado: {request.user.is_authenticated}")
            return redirect_user_by_role(user, primer_inicio, isWebView, morosidad, morosidaF)

    del request.session['access_token']
    return redirect('login')


class MicrosoftLogoutView(LoginRequiredMixin, LogoutView):
    template_name = 'registration/logged_out.html'
    next_page = reverse_lazy('login')

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            if 'access_token' in request.session:
                # Hacer una solicitud de cierre de sesión a través de la API de Microsoft Graph

                headers = {
                    "Authorization": "Bearer " + request.session['access_token']
                }

                revoke_url = f'https://graph.microsoft.com/v1.0/me/microsoft.graph.logout'

                response = requests.post(revoke_url, headers=headers)

                if response.status_code == 200:
                    request.session.flush()
                    logout(request)
                    print("Se ha cerrado sesión correctamente.")
                else:
                    print("Error al cerrar sesión.")

        return super().dispatch(request, *args, **kwargs)

    def get_next_page(self):
        next_page = super().get_next_page()
        if next_page == self.request.path:
            return self.next_page
        else:
            return next_page


class PaginaRegistroEstudiante(FormView):
    template_name = 'Usuario/registro_estudiantes.html'
    form_class = CustomUserCreationForm
    redirect_authenticated_user = True

    def form_valid(self, form):
        username = form.cleaned_data['username']
        if User.objects.filter(username=username).exists():
            form.add_error('username', 'El nombre de usuario ya está en uso.')
            return self.form_invalid(form)
        nombre_estudiante = self.request.POST.get('first_name')
        primerapellido = self.request.POST.get('last_name')
        segundoapellido = self.request.POST.get('segundoapellido')
        fecha = self.request.POST.get('fechanacimiento')
        telefono = self.request.POST.get('telefono')
        telefono2 = self.request.POST.get('telefono2')
        correo_personal = self.request.POST.get('email')
        nacionalidad = self.request.POST.get('pais')
        provincia = self.request.POST.get('provincia')
        canton = self.request.POST.get('canton')
        distrito = self.request.POST.get('distrito')
        direccion_exacta = self.request.POST.get('direccion_exacta')
        sexo = self.request.POST.get('Genero_select')
        password = self.request.POST.get('password2')

        trato = self.request.POST.get('trato')
        sexo2 = self.request.POST.get('sexo2')

        if telefono2 == '':
            telefono2 = telefono

        if sexo == 'otro':
            dato_sexo = [username, sexo2, trato]
            save_profile_processes.save_inclusivo(self.request, dato_sexo)

        tipoidentificacion = self.request.session.get('tipoIdentificacion')

        if tipoidentificacion == '01':
            tipoidentificacion = '1'
            estado_migratorio = 'Nacional'
        elif tipoidentificacion == '02':
            tipoidentificacion = '2'
            estado_migratorio = 'Nacional'
        elif tipoidentificacion == '03':
            tipoidentificacion = '3'
            estado_migratorio = 'Extranjero'

        user = User.objects.create_user(username=username, email=correo_personal, first_name=nombre_estudiante,
                                        last_name=primerapellido + " " + segundoapellido, password=password)

        datos_estudiante = [username, tipoidentificacion, estado_migratorio, nombre_estudiante, primerapellido,
                            segundoapellido, fecha, telefono, telefono2, 'No Asignado', correo_personal,
                            nacionalidad, provincia, canton, distrito, direccion_exacta, sexo]

        save = save_profile_processes.save_prospecto(self.request, datos_estudiante)

        if save:
            user = User.objects.get(username=username)

            datos_estados = [username, True, False, False]
            save_profile_processes.save_user_status(self.request, datos_estados)

            if user is not None:
                subject = 'Se ha creado su cuenta satisfactoriamente'
                mensaje = render_to_string('Correo/correo.html', {
                    'username': user.first_name + ' ' + user.last_name,
                    'mensaje1': f'Bienvenido al portal academico UIA, su cuenta se ha creado satisfactoriamente,\n\n',
                    'mensaje2': 'con el usuario',
                    'usernameU': f'{user.username}\n\n',
                    'mensaje3': 'Saludos cordiales.'
                })
                Correo.envioCorreos(correoSend=0, emailTo=correo_personal, emailCC=None, asunto=subject,
                                    mensaje=mensaje, archivo=None)

                login(self.request, user)

                registrar_accion(user, 'El usuario ' + username + ' se ha creado una cuenta como prospecto.')

                logout(self.request)

                # Agrega el contexto con el valor 'cuenta' para enviarlo junto con la redirección.
                url = reverse('login') + '?cuenta=True'
                return redirect(url)

    def get(self, *args, **kwargs):
        if self.request.user.is_authenticated:
            logout(self.request)
            return redirect('registro_estudiantes')
        return super(PaginaRegistroEstudiante, self).get(*args, **kwargs)


def registrar_accion(usuario, accion):
    registro = RegistroLogsUser(usuario=usuario, accion=accion)
    registro.save()


@login_required
def universidadesselect(request):
    valores = get_instituciones(request, 'Universidad')
    return JsonResponse(valores, safe=False)


@login_required
def sedesselect(request):
    valores = get_sedes(request)
    return JsonResponse(list(valores), safe=False)


@login_required
def asesoreselect(request):
    valores = get_asesores(request)
    return JsonResponse(list(valores), safe=False)


@login_required
def carrerasselect(request):
    sede = request.GET.get('sede')
    tipo = request.GET.get('tipo')
    valores = get_carreras(request, sede, tipo)
    return JsonResponse(list(valores), safe=False)


@login_required
def colegiosselect(request):
    valores = get_instituciones(request, 'Colegio')
    return JsonResponse(valores, safe=False)


class vistaPerfil(LoginRequiredMixin):
    context_object_name = 'perfil'
    template_name = 'Dashboard/Componentes/perfil.html'

    def profile_view(request, **kwargs):
        user = request.user

        prospecto_dict = request.session.get('user_info')
        actualizo = 'actualizo' in prospecto_dict

        if actualizo:
            cadena_formato = ''  # Lo anulamos si ya actualizó
        else:
            cadena_formato = date.today().strftime("%Y-%m-%d")

        context = {
            'user': user,
            'estudiante': prospecto_dict,
            'type': kwargs['type']
        }

        # Solo evaluar la condición si no se actualizó
        if not actualizo and cadena_formato in user.date_joined.strftime("%Y-%m-%d") and kwargs['type'] in (
                'estudiante', 'profesor'):
            context['primer_inicio'] = True
        else:
            context['primer_inicio'] = False

        return render(request, 'Dashboard/Componentes/perfil.html', context)


@login_required
def mostrar_foto(request):
    user = request.user
    try:
        foto_perfil = fotoperfil.objects.get(user=user)
        foto_bytes = bytes(foto_perfil.archivo)
    except fotoperfil.DoesNotExist:
        with open("usuario/static/img/user.png", "rb") as image_file:
            foto_bytes = image_file.read()
    return HttpResponse(foto_bytes, content_type='image/png')


@login_required
def cambiar_foto(request):
    user = request.user
    foto = request.FILES.get('fotocambio')

    img_data = foto.read()

    # Convertir la imagen a bytes
    img_bytes = bytearray(img_data)

    # Crear el objeto UserFile y guardarlo en la base de datos
    user_file = fotoperfil(user=user, archivo=img_bytes)

    try:
        img_validation = fotoperfil.objects.get(user=user)
        if img_validation is not None:
            img_validation.delete()
            user_file.save()
    except:
        user_file.save()
    return redirect(request.META.get('HTTP_REFERER'))


# ENVIO SOLICITUD DE INFORMACION
@login_required
class EnvioSolicitud(LoginRequiredMixin, View):
    context_object_name = 'envioSolicitud'
    template_name = 'Dashboard/Componentes/perfil.html'

    def enviar_solicitud(request):
        if request.method == 'POST':
            user = request.user
            grupos = user.groups.values_list('name', flat=True)

            try:
                data = json.loads(request.body.decode('utf-8'))

                fecha_nacimiento = data.get('fecha_nacimiento')
                colegio_procedencia = data.get('colegio_procedencia')
                pais = data.get('pais')
                fecha_graduacion = data.get('fecha_graduacion')
                correo_personal = data.get('correo_personal')
                ingresoEconomico = data.get('ingresoEconomico')
                provincia = data.get('provincia')
                canton = data.get('canton')
                distrito = data.get('distrito')
                direccion_exacta = data.get('direccion')
                telefono = data.get('telefono')
                telefono2 = data.get('telefono2')
                pais_sexo = data.get('pais_sexo')
                grado = data.get('grado')

                data = {}
                if 'Estudiante' in grupos:
                    data.update({
                        "identificacion": user.username,
                        "fechaNacimiento": fecha_nacimiento,
                        "colegio_id": colegio_procedencia,
                        "pais_id": pais,
                        "fecha_graduacion": fecha_graduacion,
                        "correoPersonal": correo_personal,
                        "ingresoEconomico": ingresoEconomico,
                        "numeroTelefono_Principal": telefono,
                        "numeroTelefono_secundario": telefono2,
                        "provincia_id": provincia,
                        "canton_id": canton,
                        "distrito_id": distrito,
                        "direccionExacta": direccion_exacta,
                    })
                    set = set_estudiante_info(request, data)
                elif 'Docente' in grupos:
                    data.update({
                        "identificacion": user.username,
                        "pais_id": pais,
                        "correoPersonal": correo_personal,
                        "telefono": telefono,
                        "sexo": pais_sexo,
                        "grado": grado,
                    })
                    set = set_docente_info(request, data)

                if set:
                    response_data = {'message': 'Los datos actualizados han sido enviados correctamente.'}
                    userR = request.session.get('user_info')
                    print(userR)
                    userR.update({
                        "tipo": "estudiante",
                        "identificacion": user.username,
                        "fecha_nacimiento": fecha_nacimiento,
                        "colegio_procedencia": colegio_procedencia,
                        "nacionalidad": pais,
                        "fecha_graduacion": fecha_graduacion,
                        "correo_personal": correo_personal,
                        "ingresoEconomico": ingresoEconomico,
                        "numero_telefonico": telefono,
                        "numero_telefonico2": telefono2,
                        "provincia": provincia,
                        "canton": canton,
                        "distrito": distrito,
                        "direccion_exacta": direccion_exacta,
                        "actualizo": True
                    })
                    request.session['user_info'] = userR

                    request.session.modified = True
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {
                        'message': 'Error en el envio de la solicitud. Por favor, ponte en contacto con el equipo de soporte técnico, soporte_tecnico@uia.ac.cr. Gracias.'}
                    return JsonResponse(response_data, status=400)

            except json.JSONDecodeError:
                response_data = {'message': 'Error en el formato JSON de la solicitud'}
                return JsonResponse(response_data, status=400)
        else:
            response_data = {'message': 'Método no permitido'}
            return JsonResponse(response_data, status=405)


def procesar_fotos_seguro(fotos):
    imagenes = []
    eventos_E = []
    eventos_D = []

    if fotos and isinstance(fotos, (list, tuple)):
        if len(fotos) > 0 and fotos[0]:
            imagenes = fotos[0]

        if len(fotos) > 1 and fotos[1] and isinstance(fotos[1], (list, tuple)):
            if len(fotos[1]) > 0:
                eventos_E = fotos[1][0] or []
            if len(fotos[1]) > 1:
                eventos_D = fotos[1][1] or []

    return imagenes, eventos_E, eventos_D

class DashboardView(LoginRequiredMixin, View):
    context_object_name = 'inicio'

    def get(self, request, type):
        user = request.user
        context = {
            'type': type,
            'user': user,
            'documentos': request.session.get('documentos', [])
        }

        # ================= ESTUDIANTE =================
        if type == "estudiante":
            fotos = ImagenNoticias.mostrarFotosNoticiasU(request, 'estudiante')
            imagenes, eventos_E, eventos_D = procesar_fotos_seguro(fotos)

            context.update({
                'imagenes_estudiante': imagenes,
                'eventos_seleccionadosE': eventos_E,
                'eventos_seleccionadosD': eventos_D,
                'noticia_estudiante': Noticias.mostrarNoticiasU(request, 'estudiante') or [],
            })

            return render(request, 'Dashboard/Estudiante/estudiante.html', context)

        # ================= PROSPECTO =================
        elif type == "prospecto":
            context['formProspectos'] = 'elegi'
            return render(request, 'Dashboard/Componentes/formularios.html', context)

        # ================= PROFESOR / PROFESOR-ESTUDIANTE =================
        elif type in ["profesor", "profesor-estudiante"]:
            fotos = ImagenNoticias.mostrarFotosNoticiasU(request, 'profesor')
            imagenes, eventos_E, eventos_D = procesar_fotos_seguro(fotos)

            context.update({
                'imagenes_profesor': imagenes,
                'eventos_seleccionadosE': eventos_E,
                'eventos_seleccionadosD': eventos_D,
                'noticia_profesor': Noticias.mostrarNoticiasU(request, 'profesor') or [],
            })

            return render(request, 'Dashboard/Profesor/profesor.html', context)

        # ================= TIPO NO VÁLIDO =================
        return render(request, 'Dashboard/error.html', context)


class RevisionFormView(LoginRequiredMixin, View):
    context_object_name = 'revision_form'
    template_name = 'Dashboard/Componentes/revision_form.html'

    def get_context_data(self, **kwargs):
        user = self.request.user

        # data_primer = primerIngreso.objects.get(usuario=user.pk)
        # data_documentos = documentos.objects.get(usuario=user.pk)

        doc_check = {}
        status = 'Enviado'
        estado_erp = 'Enviado'
        list_status1 = ['Enviado', 'Prospecto', 'Atendido']
        list_status2 = ['Aprobado', 'Califica para Matrícula', 'Agenda Matrícula', 'Pre Matrícula Precencial',
                        'Pre Matrícula Online']
        # estado_erp = data_primer.estado
        # if data_primer.estado in list_status1:
        #     status = 'Enviado'
        # elif data_primer.estado in list_status2:
        #     status = 'Aprobado'
        # elif data_primer.estado == 'Correccion':
        #     status = 'Correccion'
        #     if data_documentos.docTitulo == 'Rechazado':
        #         doc_check['docTitulo'] = True
        #     if data_documentos.docTituloUniversitario == 'Rechazado':
        #         doc_check['docTituloUniversitario'] = True
        #     if data_documentos.docIdentificacion == 'Rechazado':
        #         doc_check['docIdentificacion'] = True
        #     if data_documentos.docMateriasAprobadas == 'Rechazado':
        #         doc_check['docMateriasAprobadas'] = True
        #     if data_documentos.docPlanEstudios == 'Rechazado':
        #         doc_check['docPlanEstudios'] = True
        #     if data_documentos.docFotoPasaporte == 'Rechazado':
        #         doc_check['docFotoPasaporte'] = True

        context = {
            'status': status,
            'status_erp': estado_erp,
            'doc': doc_check,
            'type': self.kwargs['type'],
            'formulario': self.request.session.get('formulario', 'NA'),
        }
        return context

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        return render(request, self.template_name, context)


@login_required
def corregirdata(request):
    user = request.user

    data_primer = primerIngreso.objects.get(usuario=user.pk)
    data_primer.estado = 'Enviado'
    data_documentos = documentos.objects.get(usuario=user.pk)

    archivos = {}

    if data_documentos.docTitulo == 'Rechazado':
        archivos['docTitulo'] = request.FILES.get('docTitulo')
    if data_documentos.docTituloUniversitario == 'Rechazado':
        archivos['docTituloUniversitario'] = request.FILES.get('docTituloUniversitario')
    if data_documentos.docIdentificacion == 'Rechazado':
        archivos['docIdentificacion'] = request.FILES.get('docIdentificacion')
    if data_documentos.docMateriasAprobadas == 'Rechazado':
        archivos['docMateriasAprobadas'] = request.FILES.get('docMateriasAprobadas')
    if data_documentos.docPlanEstudios == 'Rechazado':
        archivos['docPlanEstudios'] = request.FILES.get('docPlanEstudios')
    if data_documentos.docFotoPasaporte == 'Rechazado':
        archivos['docFotoPasaporte'] = request.FILES.get('docFotoPasaporte')

    base64_data_dict = {}

    for nombre_archivo, archivo in archivos.items():
        if archivo is not None:
            contenido_archivo = archivo.read()
            base64_data = base64.b64encode(contenido_archivo).decode('utf-8')
            base64_data_dict[nombre_archivo] = base64_data

            if nombre_archivo == 'docTitulo':
                data_documentos.docTitulo = 'Enviado'
            elif nombre_archivo == 'docTituloUniversitario':
                data_documentos.docTituloUniversitario = 'Enviado'
            elif nombre_archivo == 'docIdentificacion':
                data_documentos.docIdentificacion = 'Enviado'
            elif nombre_archivo == 'docFotoPasaporte':
                data_documentos.docFotoPasaporte = 'Enviado'
            elif nombre_archivo == 'docMateriasAprobadas':
                data_documentos.docMateriasAprobadas = 'Enviado'
            elif nombre_archivo == 'docPlanEstudios':
                data_documentos.docPlanEstudios = 'Enviado'

    send = enviar_data_odoo(request, base64_data_dict)

    if send:
        data_primer.save()
        data_documentos.save()
    return redirect(request.META.get('HTTP_REFERER'))


@login_required
def enviar_archivo_a_dspace(request):
    if request.method == 'POST':
        user = request.user

        try:
            user_s = user_studies.objects.filter(identificacion=user.username)
            if user_s.exists():
                regular = True
            else:
                regular = False
        except user_studies.DoesNotExist:
            regular = False

        tipoForm = request.POST.get('tipoForm')
        asesor = request.POST.get('asesor')
        terminos = request.POST.get('flexRadioDefault')

        if terminos == 'on':
            save_profile_processes.update_user_status(request, user.username, 'terminos', True)

        archivos = {}
        carrera = request.POST.get('carrera_select')
        if tipoForm == 'primeringreso':
            tipoForm = 'PRIMER INGRESO'
            convalidacion = request.POST.get('convalidacion')
            if convalidacion == '':
                docConvalidacion = True
                if 'LICENCIATURA' in carrera:
                    archivos = {
                        'docFotoPasaporte': request.FILES.get('fotoperfil'),
                        'docTitulo': request.FILES.get('titulobachillerto'),
                        'docIdentificacion': request.FILES.get('cedulafotografia'),
                        'docTituloUniversitario': request.FILES.get('titulouniversitarioPI'),
                        'docMateriasAprobadas': request.FILES.get('certificacionnotas'),
                        'docPlanEstudios': request.FILES.get('planestudio')
                    }
                else:
                    archivos = {
                        'docFotoPasaporte': request.FILES.get('fotoperfil'),
                        'docTitulo': request.FILES.get('titulobachillerto'),
                        'docIdentificacion': request.FILES.get('cedulafotografia'),
                        'docMateriasAprobadas': request.FILES.get('certificacionnotas'),
                        'docPlanEstudios': request.FILES.get('planestudio')
                    }
            else:
                docConvalidacion = False
                if 'LICENCIATURA' in carrera:
                    archivos = {
                        'docFotoPasaporte': request.FILES.get('fotoperfil'),
                        'docTitulo': request.FILES.get('titulobachillerto'),
                        'docIdentificacion': request.FILES.get('cedulafotografia'),
                        'docTituloUniversitario': request.FILES.get('titulouniversitarioPI'),
                    }
                else:
                    archivos = {
                        'docFotoPasaporte': request.FILES.get('fotoperfil'),
                        'docTitulo': request.FILES.get('titulobachillerto'),
                        'docIdentificacion': request.FILES.get('cedulafotografia')
                    }
        elif tipoForm == 'posgrado':
            tipoForm = 'POSGRADOS'
            convalidacion = request.POST.get('convalidacion')
            if convalidacion == '':
                docConvalidacion = True
                archivos = {
                    'docFotoPasaporte': request.FILES.get('fotoperfil'),
                    'docTitulo': request.FILES.get('titulobachillerto'),
                    'docIdentificacion': request.FILES.get('cedulafotografia'),
                    'docTituloUniversitario': request.FILES.get('titulouniversitario'),
                    'docMateriasAprobadas': request.FILES.get('certificacionnotas'),
                    'docPlanEstudios': request.FILES.get('planestudio')
                }
            else:
                docConvalidacion = False
                archivos = {
                    'docFotoPasaporte': request.FILES.get('fotoperfil'),
                    'docTitulo': request.FILES.get('titulobachillerto'),
                    'docIdentificacion': request.FILES.get('cedulafotografia'),
                    'docTituloUniversitario': request.FILES.get('titulouniversitario')
                }
        elif tipoForm == 'cursolibre':
            tipoForm = 'CURSOS LIBRES'
            docConvalidacion = False
            tituloCurso = request.FILES.get('titulobachillerto')
            if tituloCurso is not None:
                archivos = {
                    'docFotoPasaporte': request.FILES.get('fotoperfil'),
                    'docIdentificacion': request.FILES.get('cedulafotografia')
                }
            else:
                archivos = {
                    'docFotoPasaporte': request.FILES.get('fotoperfil'),
                    'docTitulo': tituloCurso,
                    'docIdentificacion': request.FILES.get('cedulafotografia')
                }
        elif tipoForm == 'micromaster':
            tipoForm = 'MICROMASTER'
            docConvalidacion = False
            archivos = {
                'docFotoPasaporte': request.FILES.get('fotoperfil'),
                'docTitulo': request.FILES.get('titulobachillerto'),
                'docIdentificacion': request.FILES.get('cedulafotografia'),
                'docTituloUniversitario': request.FILES.get('titulouniversitario')
            }
        elif tipoForm == 'tecnico':
            tipoForm = 'TECNICO'
            docConvalidacion = False
            archivos = {
                'docFotoPasaporte': request.FILES.get('fotoperfil'),
                'docTitulo': request.FILES.get('titulobachillerto'),
                'docIdentificacion': request.FILES.get('cedulafotografia')
            }

        base64_data_dict = {}

        docTitulo = 'N/A'
        docTituloUniversitario = 'N/A'
        docIdentificacion = 'N/A'
        docFotoPasaporte = 'N/A'
        docMateriasAprobadas = 'N/A'
        docPlanEstudios = 'N/A'

        files_standar = files_manager.name_standardization(request, archivos)

        files_manager.save_files(request, files_standar)

        for nombre_archivo, archivo in archivos.items():
            if archivo is not None:
                contenido_archivo = archivo.read()
                base64_data = base64.b64encode(contenido_archivo).decode('utf-8')
                base64_data_dict[nombre_archivo] = base64_data

                if nombre_archivo == 'docTitulo':
                    docTitulo = 'Enviado'
                elif nombre_archivo == 'docTituloUniversitario':
                    docTituloUniversitario = 'Enviado'
                elif nombre_archivo == 'docIdentificacion':
                    docIdentificacion = 'Enviado'
                elif nombre_archivo == 'docFotoPasaporte':
                    docFotoPasaporte = 'Enviado'
                elif nombre_archivo == 'docMateriasAprobadas':
                    docMateriasAprobadas = 'Enviado'
                elif nombre_archivo == 'docPlanEstudios':
                    docPlanEstudios = 'Enviado'

        if base64_data_dict is not None:
            formulariodata = ['Enviado', docConvalidacion, 'Formulario Enviado Satisfactoriamente', user.pk]
            formulariodocumentos = [user.pk, docTitulo, docTituloUniversitario, docIdentificacion, docFotoPasaporte,
                                    docMateriasAprobadas, docPlanEstudios]

            if tipoForm == 'PRIMER INGRESO':
                tipoForm = 'PI'
                base64_data_dict['universidadProcedencia'] = request.POST.get('universidad_selectPI')
                if base64_data_dict['universidadProcedencia'] is not None:
                    base64_data_dict['universidadProcedencia'] = (base64_data_dict['universidadProcedencia']).upper()
                base64_data_dict['colegioProcedencia'] = request.POST.get('colegio_select')
                base64_data_dict['sede_id'] = request.POST.get('carrera_sede')
                base64_data_dict['carrera_id'] = carrera
                base64_data_dict['ingresoEconomico'] = request.POST.get('ingreso_economico')
                base64_data_dict['fechaGraduacion'] = request.POST.get('fechaGraduacion')
                base64_data_dict['trabajo'] = request.POST.get('divTrabajoInput')
                base64_data_dict['periodo_id'] = 'Regular'
            elif tipoForm == 'POSGRADOS':
                tipoForm = 'PP'
                base64_data_dict['universidadProcedencia'] = request.POST.get('universidad_select')
                if base64_data_dict['universidadProcedencia'] is not None:
                    base64_data_dict['universidadProcedencia'] = (base64_data_dict['universidadProcedencia']).upper()
                base64_data_dict['ingresoEconomico'] = request.POST.get('ingreso_economicoP')
                base64_data_dict['sede_id'] = request.POST.get('carrera_sede')
                base64_data_dict['carrera_id'] = carrera
                base64_data_dict['periodo_id'] = 'Posgrado'
                base64_data_dict['colegioProcedencia'] = request.POST.get('colegio_select')
                base64_data_dict['trabajo'] = request.POST.get('divTrabajoInput')
                base64_data_dict['fechaGraduacion'] = request.POST.get('fechaGraduacion')
            elif tipoForm == 'CURSOS LIBRES':
                tipoForm = 'CL'
                base64_data_dict['sede_id'] = request.POST.get('carrera_sede')
                base64_data_dict['carrera_id'] = carrera
                base64_data_dict['ingresoEconomico'] = request.POST.get('ingreso_economico')
                base64_data_dict['periodo_id'] = 'CL'
                base64_data_dict['colegioProcedencia'] = request.POST.get('colegio_select')
                base64_data_dict['universidadProcedencia'] = request.POST.get('universidad_select')
                if base64_data_dict['universidadProcedencia'] is not None:
                    base64_data_dict['universidadProcedencia'] = (base64_data_dict['universidadProcedencia']).upper()
                base64_data_dict['fechaGraduacion'] = request.POST.get('fechaGraduacion')
                base64_data_dict['trabajo'] = request.POST.get('divTrabajoInput')
            elif tipoForm == 'MICROMASTER':
                tipoForm = 'MM'
                base64_data_dict['universidadProcedencia'] = request.POST.get('universidad_select')
                if base64_data_dict['universidadProcedencia'] is not None:
                    base64_data_dict['universidadProcedencia'] = (base64_data_dict['universidadProcedencia']).upper()
                base64_data_dict['ingresoEconomico'] = request.POST.get('ingreso_economicoP')
                base64_data_dict['sede_id'] = request.POST.get('carrera_sede')
                base64_data_dict['carrera_id'] = carrera
                base64_data_dict['colegioProcedencia'] = request.POST.get('colegio_select')
                base64_data_dict['periodo_id'] = 'MM'
                base64_data_dict['trabajo'] = request.POST.get('divTrabajoInput')
                base64_data_dict['fechaGraduacion'] = request.POST.get('fechaGraduacion')
            elif tipoForm == 'TECNICO':
                tipoForm = 'TC'
                base64_data_dict['universidadProcedencia'] = request.POST.get('universidad_select')
                if base64_data_dict['universidadProcedencia'] is not None:
                    base64_data_dict['universidadProcedencia'] = (base64_data_dict['universidadProcedencia']).upper()
                base64_data_dict['sede_id'] = request.POST.get('carrera_sede')
                base64_data_dict['carrera_id'] = carrera
                base64_data_dict['colegioProcedencia'] = request.POST.get('colegio_select')
                base64_data_dict['ingresoEconomico'] = request.POST.get('ingreso_economico')
                base64_data_dict['periodo_id'] = 'Tecnico'
                base64_data_dict['fechaGraduacion'] = request.POST.get('fechaGraduacion')
                base64_data_dict['trabajo'] = request.POST.get('divTrabajoInput')

            if asesor == '':
                base64_data_dict['empleadoAsignadoInicial'] = request.POST.get('asesor_select')
            else:
                base64_data_dict['empleadoAsignadoInicial'] = 'N/A'

            save_odoo = enviar_data_odoo(request, base64_data_dict)
            save_documents = save_profile_processes.save_documents(request, formulariodata, formulariodocumentos)

            if save_odoo and save_documents:
                if regular:
                    user_studies.objects.create(identificacion=user.username, estudio=carrera, formulario=False,
                                                prematricula_envio=False, prematricula=True, matricula=True,
                                                cursando=True)
                else:
                    try:
                        user_s = user_studies.objects.get(identificacion=user.username, estudio=carrera)
                    except user_studies.DoesNotExist:
                        if regular:
                            user_studies.objects.create(identificacion=user.username, estudio=carrera, formulario=False,
                                                        prematricula_envio=False, prematricula=True, matricula=True,
                                                        cursando=True)
                        else:
                            user_studies.objects.create(identificacion=user.username, estudio=carrera, formulario=True,
                                                        prematricula_envio=True)
                nuevo_prospecto = request.session.get('user_info')
                tipo_pros = nuevo_prospecto["tipo"]
                if tipo_pros == 'prospecto':
                    context = {'type': 'prospecto'}
                    return redirect(reverse('revision_form', kwargs=context))
                else:
                    context = {'type': 'estudiante'} if tipo_pros == 'estudiante' else {'type': 'prospecto'}
                    return redirect(reverse('planEstudio', kwargs=context))


class HorarioEstudianteView(LoginRequiredMixin):
    context_object_name = 'horarioEstudiante'
    template_name = 'Dashboard/Estudiante/horarioEstudiante.html'

    def periodoHorario_view(request, **kwargs):
        user = request.user
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_cursos_estudiante'
        idProfesor = json.dumps({'identificacion': str(user.username)})
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
            'type': kwargs['type'],
            'formulario': request.session.get('formulario', 'NA'),
        }
        return render(request, 'Dashboard/Estudiante/horarioEstudiante.html', context)

    def getListHorarios(request):
        periodo = request.GET.get("periodo")
        data = request.session.get('HorariosE')
        horarios_organizados = {}

        if periodo and data:
            cursos_del_periodo = [
                curso for curso in data['data']['cursos']
                if curso['periodo_id'] == periodo
            ]

            for curso in cursos_del_periodo:
                for docente in curso["docentes"]:
                    # Regex robusto para cadenas como 'T: K (...)' o 'G1 CL Teo: K (...)'
                    match = re.search(
                        r"(?P<tipo>[A-Za-z]+)\s*:\s*(?P<dia>[A-Za-z]+)\s*\(\s*(?P<hora_inicio>\d{1,2}:\d{2})\s*-\s*(?P<hora_fin>\d{1,2}:\d{2})\s*\)",
                        docente["horarioLine_id"]
                    )

                    if match:
                        tipo = match.group("tipo")
                        dia = match.group("dia")
                        hora_inicio = match.group("hora_inicio")
                        hora_fin = match.group("hora_fin")

                        if tipo not in horarios_organizados:
                            horarios_organizados[tipo] = {"horarios": []}

                        # Evitar duplicados
                        existing_schedule = next(
                            (item for item in horarios_organizados[tipo]["horarios"]
                             if item["dia"] == dia and item["curso_id"] == curso["curso_id"]),
                            None
                        )

                        if not existing_schedule:
                            horarios_organizados[tipo]["horarios"].append({
                                "curso_id": curso["curso_id"],
                                "dia": dia,
                                "grupo": curso["grupo"],
                                "docente_id": docente["docente_id"],
                                "aula_id": docente["aula_id"],
                                "horaInicio": hora_inicio.split(':')[0],
                                "minutoInicio": hora_inicio.split(':')[1],
                                "horaFin": hora_fin.split(':')[0],
                                "minutoFin": hora_fin.split(':')[1]
                            })

        # Formato final de respuesta
        resultado_final = {}
        for tipo, detalles in horarios_organizados.items():
            resultado_final[tipo] = []
            for detalle in detalles["horarios"]:
                resultado_final[tipo].append({
                    "curso_id": detalle["curso_id"],
                    "dia": detalle["dia"],
                    "grupo": detalle["grupo"],
                    "docente_id": detalle["docente_id"],
                    "aula_id": detalle["aula_id"],
                    "horaInicio": detalle["horaInicio"],
                    "minutoInicio": detalle["minutoInicio"],
                    "horaFin": detalle["horaFin"],
                    "minutoFin": detalle["minutoFin"]
                })

        print(resultado_final)  # Para debug
        return JsonResponse(resultado_final, safe=False)


class PlanDeEstudioView(LoginRequiredMixin, View):
    context_object_name = 'planEstudio'
    template_name = 'Dashboard/Estudiante/planEstudio.html'

    def get_context_data(self, **kwargs):
        user = self.request.user
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_planes_estudio'
        idEstudiante = json.dumps({'identificacion': str(user.username)})
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.request("GET", url, headers=headers, data=idEstudiante)
        data = json.loads(response.text)['result']
        context = {
            'user': user,
            'carrera': data,
            'type': self.kwargs['type'],
            'formulario': self.request.session.get('formulario', 'NA'),
        }
        return context

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        return render(request, self.template_name, context)


class DetallePlanDeEstudioView(LoginRequiredMixin):
    context_object_name = 'planEstudioCarrera'
    template_name = 'Dashboard/Estudiante/planEstudio.html'

    def getPlan(request, type):
        user_id = request.session.get('usuarioIns')
        if user_id:
            try:
                userAux = User.objects.get(username=user_id)
            except User.DoesNotExist:
                userAux = None
        else:
            userAux = None
        user = userAux if request.user.username == 'soporte' else request.user
        plan = request.GET.get('plan')
        idEstudiante = json.dumps(
            {'plan': plan, 'identificacion': str(user.username)})

        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_planes_estudio_curricula'
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.request("GET", url, headers=headers, data=idEstudiante)
        data = json.loads(response.text)['result']
        planE = []
        planE.append(data)
        return JsonResponse(planE, safe=False)

    def verPrematricula(request):
        user = request.user
        plan = request.GET.get('plan')
        idEstudiante = json.dumps({'identificacion': str(user.username), 'plan': plan})
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_pre_matricula_modificar'
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.request("POST", url, headers=headers, data=idEstudiante)
        data = json.loads(response.text)['result']['data']['result']
        if len(data) == 0:
            request.session['actualizarPre'] = False
            return JsonResponse(data, safe=False)
        else:
            request.session['actualizarPre'] = True
        return JsonResponse(data, safe=False)

    def verCambio(request):
        user = request.user
        plan = request.GET.get('plan')
        idEstudiante = json.dumps({'planEstudio_id': plan, 'identificacion': str(user.username)})
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_matricula'
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.request("POST", url, headers=headers, data=idEstudiante)
        data = json.loads(response.text)['result']['data']['result']
        return JsonResponse(data, safe=False)

    def cambioCurso(request):
        json_data = json.loads(request.body)
        user = request.user
        json_data['identificacion'] = str(user.username)
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/set_matricula_cambio'

        headers = {'Content-Type': 'application/json'}
        payload = json.dumps(json_data)

        response = requests.request("POST", url, headers=headers, data=payload)
        data = json.loads(response.text)
        dict = data['result']['data']
        return JsonResponse(dict, safe=False)


class MisCursos(LoginRequiredMixin):
    context_object_name = 'misCursos'
    template_name = 'Dashboard/Estudiante/misCursos.html'

    def periodoCurso_view(request, **kwargs):
        user = request.user
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_cursos_estudiante'
        idProfesor = json.dumps({'identificacion': str(user.username)})
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
            'type': kwargs['type'],
            'formulario': request.session.get('formulario', 'NA'),
        }
        return render(request, 'Dashboard/Estudiante/misCursos.html', context)

    def getCurso(request):
        user_id = request.session.get('usuarioIns')
        if user_id:
            try:
                userAux = User.objects.get(username=user_id)
            except User.DoesNotExist:
                userAux = None
        else:
            userAux = None
        user = userAux if request.user.username == 'soporte' else request.user
        periodo = request.GET.get('periodo')
        id = json.dumps({'identificacion': str(user.username)})
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_cursos_estudiante'
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.request("GET", url, headers=headers, data=id)
        data = json.loads(response.text)
        cursos_periodo_especifico = [curso for curso in data["result"]["data"]["cursos"] if
                                     curso["periodo_id"] == periodo]
        return JsonResponse(cursos_periodo_especifico, safe=False)


class MatriculaView(LoginRequiredMixin, View):
    context_object_name = 'matricula'
    template_name = 'Dashboard/Componentes/matriculaEstudiante.html'

    def get_context_data(self, **kwargs):
        user = self.request.user
        data = {
            "identificacion": str(user.username)  # user.username
        }
        headers = {
            'Content-Type': 'application/json'
        }
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_pre_matricula'
        response = requests.request('POST', url, data=json.dumps(data), headers=headers)
        data = json.loads(response.text)
        self.request.session['data_periodos'] = data

        registros = {}
        periodos = {}
        lista_consulta = []
        lista_resultado = data['result']['data']['valsCostos']
        lineaNegocio = False
        # lineaNegocio = data['result']['data']['valsCostos']['lineaNegocio']

        for informacion in data['result']['data']['valsCostos']:
            periodos[informacion["periodo"]] = informacion["periodo"]

        for periodos_lista in periodos:
            lista_consulta.append(list(filter(lambda x: x['periodo'] == periodos_lista, lista_resultado)))

        datapago = {
            'matricula': '----',
            'descuentoTotal': '----',
            'preMatricula': '----',
            'becaId': '----',
            'descuentoId': '----',
            'ordenVenta': '----'
        }

        if len(lista_consulta) > 1:
            periodos_varios = True
            self.request.session['periodos_varios'] = periodos_varios
            self.request.session.save()
        else:
            if len(lista_consulta[0]) > 1:
                periodos_varios = True
                self.request.session['periodos_varios'] = periodos_varios
                self.request.session.save()
            else:
                periodos_varios = False
                lineaNegocio = lista_consulta[0][0]['lineaNegocio']
                periodos = next(iter(periodos.values()))
                montos = lista_consulta[0][0]
                cursos = montos['cursos']
                datapago = {
                    'matricula': montos['monto_Matricula'],
                    'monto_Contado': montos['monto_Contado'],
                    'preMatricula': montos['monto_Total'],
                    'becaId': montos['beca_id'],
                    'descuentoId': montos['descuento_id'],
                    'ordenVenta': montos['orden_venta_id']
                }
                self.request.session['ordenVenta'] = montos['orden_venta_id']
                self.request.session['preMatricula'] = montos['monto_Total']
                self.request.session.save()
                for curso in cursos:
                    cursos_registrados = {}
                    cursos_registrados["curso_id"] = curso["curso_id"]
                    cursos_registrados["horario_id"] = curso["horario_id"]
                    registros[str(curso["curso_id"])] = cursos_registrados
        context = {
            'periodos_varios': periodos_varios,
            'periodos': periodos,
            'registro': registros,
            'user': user,
            'pago': datapago,
            'type': self.kwargs['type'],
            'lineaNegocio': lineaNegocio,
            'formulario': self.request.session.get('formulario', 'NA'),
        }

        return context

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        return render(request, self.template_name, context)


@login_required
def periodos_matriculados(request):
    periodo_select = request.GET.get("periodo")
    data_periodos = request.session.get('data_periodos')

    lista_consulta = []
    lista_resultado = data_periodos['result']['data']['valsCostos']
    list_montos = []
    list_cursos = []
    list_carreras = {}
    list_completa = {}
    montos = {}
    lineaNegocio = False

    lista_consulta.append(list(filter(lambda x: x['periodo'] == periodo_select, lista_resultado)))

    if len(lista_consulta[0]) > 1:
        request.session['data_periodos_carreras'] = lista_consulta
        lista_consulta_carrera = request.session.get('data_periodos_carreras')
        request.session.save()
        cantPeriodos = True
        cont = 0
        for carrerasperiodo in lista_consulta_carrera[0]:
            carrerasperiodo['periodo_cons'] = carrerasperiodo['planEstudio_id'] + ' - ' + str(cont)
            list_carreras[carrerasperiodo['periodo_cons']] = carrerasperiodo['planEstudio_id'].title()
            cont += 1
            lineaNegocio = carrerasperiodo['lineaNegocio']
    else:
        cantPeriodos = False
        montos = lista_consulta[0][0]
        cursos = montos['cursos']
        montos['monto_Matricula'] = montos['monto_Matricula'],
        montos['monto_Contado'] = montos['monto_Contado'],
        montos['monto_Total'] = montos['monto_Total'],
        montos['beca_id'] = montos['beca_id'],
        montos['descuento_id'] = montos['descuento_id'],
        montos['orden_venta_id'] = montos['orden_venta_id']
        lineaNegocio = montos['lineaNegocio']
        request.session['ordenVenta'] = montos['orden_venta_id']
        request.session['preMatricula'] = montos['monto_Total']
        request.session.save()
        list_montos.append(montos)
        for curso in cursos:
            cursos_registrados = {}
            cursos_registrados["curso_id"] = curso["curso_id"]
            cursos_registrados["horario_id"] = curso["horario_id"]
            list_cursos.append(cursos_registrados)

    list_completa = {
        'periodos': cantPeriodos,
        'carreras': list_carreras,
        'montos': list_montos,
        'cursos': list_cursos,
        'lineaNegocio': lineaNegocio
    }
    return JsonResponse(data=list_completa, safe=False, status=200)


@login_required
def periodos_carreras_matriculados(request):
    periodo_select = request.GET.get("periodo")
    carrera_select = request.GET.get("carrera")
    data_periodos = request.session.get('data_periodos_carreras')

    lista_consulta = []
    list_montos = []
    list_cursos = []
    list_completa = {}
    montos = {}

    for periodo in data_periodos[0]:
        if periodo['periodo_cons'] == carrera_select:
            montos = periodo
            cursos = montos['cursos']
            montos['monto_Matricula'] = montos['monto_Matricula'],
            montos['monto_Contado'] = montos['monto_Contado'],
            montos['monto_Total'] = montos['monto_Total'],
            montos['beca_id'] = montos['beca_id'],
            montos['descuento_id'] = montos['descuento_id'],
            montos['orden_venta_id'] = montos['orden_venta_id']
            request.session['ordenVenta'] = montos['orden_venta_id']
            request.session['preMatricula'] = montos['monto_Total']
            list_montos.append(montos)
            for curso in cursos:
                cursos_registrados = {}
                cursos_registrados["curso_id"] = curso["curso_id"]
                cursos_registrados["horario_id"] = curso["horario_id"]
                list_cursos.append(cursos_registrados)
            break

    list_completa = {
        'montos': list_montos,
        'cursos': list_cursos
    }
    return JsonResponse(data=list_completa, safe=False, status=200)


class EstadoDeCuentaEstudiante(LoginRequiredMixin, View):
    context_object_name = 'estadoCuentaEstudiante'
    template_name = 'Dashboard/Estudiante/estadoDeCuentaEstudiante.html'

    def get_monto_total(request):
        user = request.user
        contado = float(request.GET.get('contado'))
        saldoFavorAbono = float(request.GET.get('saldoFavor'))
        print(user.username)
        request.session['preMatricula'] = contado
        request.session['saldoFavorAbono'] = saldoFavorAbono
        request.session['ordenVenta'] = user.username + '-' + 'abonoLetra'
        return JsonResponse({'contado': contado})

    def get_consecutivo(request):
        user = request.user
        consecutivo = request.GET.get('consecutivo')
        request.session['consecutivo'] = consecutivo if consecutivo else request.session.get('consecutivo')
        saldoF = request.session.get('saldoF')
        return JsonResponse({
            'consecutivo': consecutivo,
            'saldoFavor': saldoF if saldoF else 0,
            'interesC': saldoF if saldoF else None,
            'interesM': saldoF if saldoF else None,
        })

    def verAbono(request, **kwargs):
        user_status_update(request)
        user = request.user
        url_api_erp = str(settings.URL_API_ERP)
        consecutivo = request.session.get('consecutivo')

        # Si el consecutivo no está en la sesión, devolver un error
        if not consecutivo:
            return JsonResponse({'error': 'No consecutivo encontrado en la sesión'}, status=400)

        # Hacer la solicitud para obtener los datos de la API
        url = f'http://{url_api_erp}/get_pagare_estudiante_consecutivo'
        payload = json.dumps({"consecutivo": consecutivo})
        headers = {'Content-Type': 'application/json'}

        try:
            response = requests.get(url, headers=headers, data=payload)
            response.raise_for_status()  # Verifica si hubo algún error en la respuesta
            data = response.json()['result']  # Parsear la respuesta JSON
        except requests.exceptions.RequestException as e:
            print(f"Error al realizar la solicitud: {e}")
            return JsonResponse({'error': 'Error al obtener los datos del abono'}, status=500)

        # Verificar si los datos son válidos antes de almacenarlos
        if data:
            request.session['pagareAbono'] = data
            request.session['saldoF'] = data['data']['pagare']['saldo_favor']
            request.session['interesC'] = data['data']['pagare']['intereses']
            request.session['interesM'] = data['data']['pagare']['moratorio']
        else:
            print('No se recibieron datos válidos del pagare')

        context = {
            'user': user,
            'financiamiento': data if data else request.session.get('pagareAbono'),
            'consecutivo': consecutivo,
            'type': kwargs.get('type'),
            'formulario': request.session.get('formulario', 'NA'),
            'linea': EstadoDeCuentaEstudiante.getCarreraLinea(request)
        }

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            rendered_html = render_to_string('Dashboard/Componentes/abonoPagare.html', context)
            return JsonResponse(
                {'html': rendered_html, 'status': 'success', 'interesC': request.session.get('interesC'),
                 'interesM': request.session.get('interesM')})

        return render(request, 'Dashboard/Componentes/abonoPagare.html', context)

    def estadoCuentaEstudiante(request, **kwargs):
        user = request.user
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_pagare_estudiante'
        payload = json.dumps({
            "identificacion": user.username,
        })
        headers = {
            'Content-Type': 'application/json',
        }
        response = requests.request("GET", url, headers=headers, data=payload)
        data = json.loads(response.text)['result']
        request.session['pagare'] = data

        context = {
            'user': user,
            'financiamiento': data,
            'type': kwargs['type'],
            'formulario': request.session.get('formulario', 'NA'),
            'financiero': request.session.get('financiero'),
            'documentos': request.session.get('documentos'),
            'linea': EstadoDeCuentaEstudiante.getCarreraLinea(request)
        }
        return render(request, 'Dashboard/Estudiante/estadoDeCuentaEstudiante.html', context)

    def getCarreraLinea(request):
        user = request.user
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_carrera_linea_credito_estudiante'
        payload = json.dumps({"identificacion": user.username})
        headers = {
            'Content-Type': 'application/json',
        }
        response = requests.request("GET", url, headers=headers, data=payload)
        data = json.loads(response.text)['result']
        if 'carrera_LC' in data['data'] and len(data['data']['carrera_LC']) == 1:
            return data['data']['carrera_LC'][0]
        else:
            return data

    def getDetalleCarreraLinea(request):
        user = request.user
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_detalle_linea_credito_estudiante'
        payload = json.dumps({"identificacion": user.username, "carrera_id": request.GET.get('carrera')})
        headers = {
            'Content-Type': 'application/json',
        }
        response = requests.request("GET", url, headers=headers, data=payload)
        data = json.loads(response.text)['result']

        lineaC = []
        lineaC.append(data)
        print
        return JsonResponse(lineaC, safe=False)


class SuficienciaView(LoginRequiredMixin, View):
    context_object_name = 'suficiencia'
    template_name = 'Dashboard/Estudiante/suficienciaEstudiante.html'

    def get_context_data(self, **kwargs):
        user = self.request.user

        context = {
            'user': user,
            'type': self.kwargs['type'],
            'formulario': self.request.session.get('formulario', 'NA'),
        }
        return context

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        return render(request, self.template_name, context)


@login_required
def datos_factura(request):
    data = {}
    datos = request.GET.get('datos')
    pattern = r"[a-zA-Z]"
    pattern_numerico = r"\d"
    data_factura = json.loads(datos)
    if data_factura[0] == 'info-personal':
        user = request.session.get('user_info')
        data_factura = []
        data_factura.append(user['nombre'] + ' ' + user['primer_apellido'] + ' ' + user['segundo_apellido'])
        if len(user['identificacion']) == 9 and re.search(pattern_numerico, user['identificacion']):
            data_factura.append('1')
        elif len(user['identificacion']) >= 10 and re.search(pattern_numerico, user['identificacion']):
            data_factura.append('3')
        elif re.match(pattern, user['identificacion']):
            data_factura.append('10')
        data_factura.append(str(user['identificacion']))
        data_factura.append(user['correo_personal'])
        data_factura.append(str(user['numero_telefonico']))
        data_factura.append(user['provincia'])
        data_factura.append(user['canton'])
        data_factura.append(user['distrito'])
        data_factura.append(user['direccion_exacta'])
        data_factura.append('Individual')

    request.session['datos_factura'] = data_factura
    request.session.save()
    return JsonResponse(data=data, safe=False, status=200)


class ResumenPagoGeneralView(LoginRequiredMixin, View):
    context_object_name = 'resumen'
    template_name = 'Dashboard/Componentes/resumenPago.html'

    def get_context_data(self, **kwargs):
        user = self.request.user
        data = {
            "identificacion": str(user.username)  # user.username
        }
        headers = {
            'Content-Type': 'application/json'
        }
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_pre_matricula'
        response = requests.request('POST', url, data=json.dumps(data), headers=headers)
        data = json.loads(response.text)
        self.request.session['data_periodos'] = data

        registros = {}
        periodos = {}
        lista_consulta = []
        periodos_varios = False
        lista_resultado = data['result']['data']['valsCostos']

        for informacion in data['result']['data']['valsCostos']:
            periodos[informacion["periodo"]] = informacion["periodo"]

        for periodos_lista in periodos:
            lista_consulta.append(list(filter(lambda x: x['periodo'] == periodos_lista, lista_resultado)))

        datapago = {
            'matricula': '----',
            'descuentoTotal': '----',
            'preMatricula': '----',
            'becaId': '----',
            'descuentoId': '----',
            'ordenVenta': '----'
        }
        if len(lista_consulta):

            if len(lista_consulta) > 1:
                periodos_varios = True
                self.request.session['periodos_varios'] = periodos_varios
                self.request.session.save()
            else:
                if len(lista_consulta[0]) > 1:
                    periodos_varios = True
                    self.request.session['periodos_varios'] = periodos_varios
                    self.request.session.save()
                else:
                    periodos_varios = False
                    periodos = next(iter(periodos.values()))
                    montos = lista_consulta[0][0]
                    cursos = montos['cursos']
                    datapago = {
                        'matricula': montos['monto_Matricula'],
                        'monto_Contado': montos['monto_Contado'],
                        'preMatricula': montos['monto_Total'],
                        'becaId': montos['beca_id'],
                        'descuentoId': montos['descuento_id'],
                        'ordenVenta': montos['orden_venta_id']
                    }
                    self.request.session['ordenVenta'] = montos['orden_venta_id']
                    self.request.session['preMatricula'] = montos['monto_Total']
                    self.request.session.save()
                    for curso in cursos:
                        cursos_registrados = {}
                        cursos_registrados["curso_id"] = curso["curso_id"]
                        cursos_registrados["horario_id"] = curso["horario_id"]
                        registros[str(curso["curso_id"])] = cursos_registrados
        context = {
            'periodos_varios': periodos_varios,
            'periodos': periodos,
            'registro': registros,
            'user': user,
            'pago': datapago,
            'type': self.kwargs['type'],
            'formulario': self.request.session.get('formulario', 'NA'),
        }

        return context

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        return render(request, self.template_name, context)


class EstudiarUIA(LoginRequiredMixin, View):
    context_object_name = 'inicio'

    def get(self, request, type):
        user = request.user
        context = {
            'type': type,
            'user': user,
        }
        return render(request, 'Dashboard/Componentes/formularios.html', context)


# REQUIERE MOFICACION FINAL
class Payment(LoginRequiredMixin, View):
    context_object_name = 'payment'
    template_name = 'Dashboard/Componentes/payment.html'

    def get_context_data(self, **kwargs):
        user = self.request.user

        amount = self.request.session.get('preMatricula')
        if isinstance(amount, list) and len(amount) == 1 and isinstance(amount[0], float):
            amount = amount[0]
        amount_str = str(amount).replace(',', '.')
        amount_str += "0"
        # amount_str = "10.00" #BORRAR LINEA COMPLETA
        datapago = {
            'amount': amount_str
        }

        if 'ordenVenta' in self.request.session:
            orderid = self.request.session.get('ordenVenta') + '-' + user.username
        else:
            orderid = user.username + '-PagoMatricula'
            self.request.session['ordenVenta'] = orderid

        key_id = obtener_keyiD(self.request)
        time = obtener_fecha_unix(self.request)
        hash = obtener_hash_entrada(self.request, amount_str, time, orderid)

        context = {
            'user': user,
            'key_id': key_id,
            'hash': hash,
            'time': time,
            'orderid': orderid,
            'pago': datapago,
            'llamar_time': True,
            'type': kwargs['type'],
            'formulario': self.request.session.get('formulario', 'NA'),
        }
        return context

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        return render(request, self.template_name, context)


class HorarioPlanDeEstudioView(LoginRequiredMixin):
    context_object_name = 'horarioCursoPlan'
    template_name = 'Dashboard/Estudiante/planEstudio.html'

    def getHorario(request):
        cursos = request.GET.get('cursos')
        course_dict = json.loads(cursos)
        cursoSeleccionados = json.dumps(course_dict)
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_horarios_curso'
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.request("GET", url, headers=headers, data=cursoSeleccionados)
        data = json.loads(response.text)['result']
        horariosCursos = []
        horariosCursos.append(data)
        return JsonResponse(horariosCursos, safe=False)


class Ubicacion(LoginRequiredMixin):
    context_object_name = 'ubicacion'

    def ubicacion_view(request, type):
        user = request.user

        context = {
            'user': user,
            'type': type,
            'formulario': request.session.get('formulario', 'NA'),
        }
        return render(request, 'Dashboard/Componentes/ubicacion.html', context)


class EnvioPrematricula(LoginRequiredMixin, View):
    context_object_name = 'envioPrematricula'
    template_name = 'Dashboard/Estudiante/planEstudio.html'

    def envioPrematricula(request):
        json_data = json.loads(request.body)
        type = json_data['type']
        del json_data['type']
        user = request.user
        json_data['identificacion'] = str(user.username)
        url_api_erp = str(settings.URL_API_ERP)
        validar = request.session.get('actualizarPre')
        if validar:
            url = 'http://' + url_api_erp + '/set_pre_matricula_modificar'
        else:
            url = 'http://' + url_api_erp + '/set_pre_matricula'

        headers = {'Content-Type': 'application/json'}
        payload = json.dumps(json_data)

        response = requests.request("POST", url, headers=headers, data=payload)
        data = json.loads(response.text)
        result = data.get('result')
        request.session['actualizarPre'] = True
        if isinstance(result, dict) and result.get('error'):
            return JsonResponse({'error': result.get('detalle')}, safe=False)
        user_s = user_studies.objects.filter(identificacion=user.username)
        if user_s:
            for studies in user_s:
                similarity = text_similarity(studies.estudio, json_data['planEstudio_id'])
                if similarity > 0.5:
                    studies.prematricula_envio = True
                    studies.formulario = False
                    studies.save()
        context = {'type': type}
        urlN = redirect(reverse('matricula', kwargs=context))
        return JsonResponse({'url': urlN.url}, safe=False)


class Contactenos(LoginRequiredMixin):
    context_object_name = 'contactenos'

    def contactenos_view(request, type):
        user = request.user

        context = {
            'user': user,
            'type': type,
            'formulario': request.session.get('formulario', 'NA'),
        }
        return render(request, 'Dashboard/Componentes/contactenos.html', context)


class Politicas(LoginRequiredMixin):
    context_object_name = 'politicas'

    def politicas_view(request, type):
        user = request.user

        context = {
            'user': user,
            'type': type,
            'formulario': request.session.get('formulario', 'NA'),
        }

        return render(request, 'Dashboard/Componentes/politicasPrivacidad.html', context)


class Terminos(LoginRequiredMixin):
    context_object_name = 'terminos'

    def terminos_view(request, type):
        user = request.user
        context = {
            'user': user,
            'type': type,
            'formulario': request.session.get('formulario', 'NA'),
        }

        return render(request, 'Dashboard/Componentes/TerminosCondiciones.html', context)


class MiscursosP(LoginRequiredMixin, View):
    context_object_name = 'misCursosP'
    template_name = 'Dashboard/Profesor/misCursos.html'

    def misCursos_view(request, **kwargs):
        user = request.user
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_docente_periodos'
        idProfesor = json.dumps({'identificacion': str(user.username)})
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
            'type': kwargs['type'],
            'formulario': request.session.get('formulario', 'NA'),
        }
        return render(request, 'Dashboard/Profesor/misCursos.html', context)

    def detalleCursoPeriodo(request):
        periodo = request.GET.get("periodo")
        user_id = request.session.get('usuarioIns')
        if user_id:
            try:
                userAux = User.objects.get(username=user_id)
            except User.DoesNotExist:
                userAux = None
        else:
            userAux = None
        user = userAux if request.user.username == 'soporte' else request.user
        idenntificacion = str(user.username)
        data = request.session.get('misCursoP')
        asistencia_json = {"asistencias": []}
        for curso in data['data']['periodos']:
            if curso['periodo'] == periodo:
                for horario in curso['horarios']:
                    if horario.get('padre') is not True:
                        continue
                    nombre_curso = horario['curso']
                    acta = horario['acta']
                    horarioC = horario['horario']
                    idAsistencia = horario['asistencia_id']
                    asistencia_data = {
                        "curso": nombre_curso,
                        "horario": horarioC,
                        "idAsistencia": idAsistencia,
                        "asistenciaCurso": [{
                            "periodo": periodo,
                            "acta": acta,
                            "identificacion": idenntificacion
                        }]
                    }
                    asistencia_json["asistencias"].append(asistencia_data)
        for curso in data['data']['periodos']:
            curso['horarios'] = [
                h for h in curso.get('horarios', [])
                if h.get('padre') is True
            ]
        request.session['misCursoP'] = data
        request.session['asistenciaCursos'] = asistencia_json
        return JsonResponse(data, safe=False)

    @staticmethod
    def fetch_asistencia(session, asistencia, headers, url_api_erp, semana, username):
        periodo = asistencia['asistenciaCurso'][0]['periodo']
        acta = asistencia['asistenciaCurso'][0]['acta']
        identificacion = asistencia['asistenciaCurso'][0]['identificacion']
        asistenciaid = asistencia['idAsistencia']
        horarioLine_id = asistencia['horario']

        base = {
            "curso": asistencia['curso'],
            "horario": asistencia['horario'],
            "idAsistencia": asistencia['idAsistencia'],
        }

        try:
            # Intento 1: por semana
            response = session.get(
                f'http://{url_api_erp}/get_asistencia_semana',
                headers=headers,
                data=json.dumps({
                    "periodo": periodo,
                    "asistencia": asistenciaid,
                    "horarioLine_id": horarioLine_id,
                    "identificacion": identificacion,
                    "semana": semana,
                }),
                timeout=40,
            )
            response.raise_for_status()
            data = response.json()['result']

            if data['data']['estudiantes']:
                return {**base, "resultado": data}
            else:

                # Intento 2: fallback por acta
                response = session.get(  # ← session del parámetro
                    f'http://{url_api_erp}/get_asistencia',
                    headers=headers,
                    data=json.dumps({
                        "periodo": periodo,
                        "acta": acta,
                        "identificacion": str(username),
                    }),
                    timeout=40,
                )
                response.raise_for_status()
                data = response.json()['result']

                if data['data']['estudiantes']:
                    return {**base, "resultado": data}

        except (requests.RequestException, KeyError, ValueError) as e:
            logger.warning(f"Error fetching asistencia {asistenciaid}: {e}")

        return None

    def listEstudiante(request):
        user_id = request.session.get('usuarioIns')
        if user_id:
            try:
                userAux = User.objects.get(username=user_id)
            except User.DoesNotExist:
                userAux = None
        else:
            userAux = None
        user = userAux if request.user.username == 'soporte' else request.user
        type = request.GET.get('tipo')
        semana = request.GET.get('semana')
        periodo = request.GET.get('periodo')
        acta = request.GET.get('acta')
        identificacion = str(user.username)
        dataE = []
        url_api_erp = str(settings.URL_API_ERP)
        payload = json.dumps({
            "periodo": periodo,
            "acta": acta,
            "identificacion": str(user.username)
        })
        headers = {
            'Content-Type': 'application/json'
        }
        if type == 'actas' or type == 'notaPar' or type == 'notaFin' or type == 'notasExtra':

            url = 'http://' + url_api_erp + '/get_acta_curso'

            response = requests.request("GET", url, headers=headers, data=payload)
            data = json.loads(response.text)['result']
            request.session['listEstudiante'] = data
            dataE = MiscursosP.getDataEs(data)
            dataPorc = request.session.get('misCursoP')
            evaluacion_1 = dataPorc['data']['periodos'][0]['horarios'][0]['evaluacion_1']
            evaluacion_2 = dataPorc['data']['periodos'][0]['horarios'][0]['evaluacion_2']
            evaluacion_3 = dataPorc['data']['periodos'][0]['horarios'][0]['evaluacion_3']
            evaluacion_Otro = dataPorc['data']['periodos'][0]['horarios'][0]['evaluacion_Otro']
            porcentajes = [{'evaluacion_1': evaluacion_1}, {'evaluacion_2': evaluacion_2},
                           {'evaluacion_3': evaluacion_3}, {'evaluacion_Otro': evaluacion_Otro}]
            return JsonResponse({
                'dataE': dataE,
                'porcentajes': porcentajes
            }, safe=False)
        elif type == 'asistencia':
            asistencia_json = request.session.get('asistenciaCursos', {})

            if not asistencia_json:
                return JsonResponse([], safe=False)

            http_session = requests.Session()  # Reutiliza conexiones TCP

            with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                futures = [
                    executor.submit(
                        MiscursosP.fetch_asistencia, http_session,
                        asistencia, headers, url_api_erp, semana, user.username
                    )
                    for asistencia in asistencia_json['asistencias']
                ]
                asistenciaCursos = [
                    f.result()
                    for f in concurrent.futures.as_completed(futures)
                    if f.result() is not None
                ]

            request.session['listEstudiante'] = asistenciaCursos
            return JsonResponse(asistenciaCursos, safe=False)
        else:
            url = 'http://' + url_api_erp + '/get_asistencia'
            response = requests.request("GET", url, headers=headers, data=payload)
            data = json.loads(response.text)['result']
            dataE = MiscursosP.getDataEs(data)
            request.session['listEstudiante'] = data
            return JsonResponse(dataE, safe=False)

    def getDataEs(data):
        dataAux = []
        for curso in data['data']['estudiantes']:
            dataAux.append(curso)
        return dataAux

    def getDataAs(data):
        dataAux = []
        for curso in data['data']['carreras']:
            dataAux.append(curso)
        return dataAux

    def enviarERP(request):
        user_id = request.session.get('usuarioIns')
        if user_id:
            try:
                userAux = User.objects.get(username=user_id)
            except User.DoesNotExist:
                userAux = None
        else:
            userAux = None
        user = userAux if request.user.username == 'soporte' else request.user
        tipo = request.GET.get('tipo')
        json_data = json.loads(request.body)
        json_data['identificacion'] = str(user.username)
        headers = {'Content-Type': 'application/json'}
        url = ""
        url_api_erp = str(settings.URL_API_ERP)
        if tipo == 'notaPar':
            url = 'http://' + url_api_erp + '/set_nota_parciales'

        elif tipo == 'notaFinalPre':
            url = 'http://' + url_api_erp + '/set_nota_preliminar'

        elif tipo == 'notaExtra':
            url = 'http://' + url_api_erp + '/set_nota_Ext'

        elif tipo == 'notaFinal':
            url = 'http://' + url_api_erp + '/set_nota_notaFinal'

        elif tipo == 'asistencia':
            url = 'http://' + url_api_erp + '/set_asistencia'
        elif tipo == 'porcentaje':
            url = 'http://' + url_api_erp + '/set_porcentaje'
        elif tipo == 'notaFinalEstado':
            url = 'http://' + url_api_erp + '/set_nota_estado'
        payload = json.dumps(json_data)
        response = requests.request("POST", url, headers=headers, data=payload)
        data = json.loads(response.text)
        return JsonResponse(data, safe=False)

    def historial_curso_view(request, **kwargs):
        user_id = request.session.get('usuarioIns')
        if user_id:
            try:
                userAux = User.objects.get(username=user_id)
            except User.DoesNotExist:
                userAux = None
        else:
            userAux = None
        user = userAux if request.user.username == 'soporte' else request.user
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_docente_periodos_historial'
        idProfesor = json.dumps({'identificacion': str(user.username)})
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.request("POST", url, headers=headers, data=idProfesor)
        data = json.loads(response.text)['result']
        dataP = []
        for curso in data['data']['periodos']:
            dataP.append(curso['periodo'])
        request.session['misCursoPH'] = data
        context = {
            'user': user,
            'misCursosH': dataP,
            'type': kwargs['type'],
            'formulario': request.session.get('formulario', 'NA'),
        }
        return render(request, 'Dashboard/Profesor/misCursosHistorial.html', context)

    def detalleHistorialCursoPeriodo(request):
        periodo = request.GET.get("periodo")
        user_id = request.session.get('usuarioIns')
        if user_id:
            try:
                userAux = User.objects.get(username=user_id)
            except User.DoesNotExist:
                userAux = None
        else:
            userAux = None
        user = userAux if request.user.username == 'soporte' else request.user
        idenntificacion = str(user.username)
        data = request.session.get('misCursoPH')
        asistencia_json = {"asistencias": []}
        for curso in data['data']['periodos']:
            if curso['periodo'] == periodo:
                for horario in curso['horarios']:
                    if horario.get('padre') is not True:
                        continue
                    nombre_curso = horario['curso']
                    acta = horario['acta']
                    horarioC = horario['horario']
                    idAsistencia = horario['asistencia_id']
                    asistencia_data = {
                        "curso": nombre_curso,
                        "horario": horarioC,
                        "idAsistencia" : idAsistencia,
                        "asistenciaCurso": [{
                            "periodo": periodo,
                            "acta": acta,
                            "identificacion": idenntificacion
                        }]
                    }
        for curso in data['data']['periodos']:
            curso['horarios'] = [
                h for h in curso.get('horarios', [])
                if h.get('padre') is True
            ]
        request.session['misCursoPH'] = data
        return JsonResponse(data, safe=False)

    def historial_acta():
        pass

    def descargar_asistencia_pdf(request, periodo, acta, codigo_curso):
        headers = {'Content-Type': 'application/json'}
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_asistencia'
        payload = json.dumps({
            "periodo": periodo,
            "acta": acta,
            "identificacion": str(request.user.username)
        })
        response = requests.request("GET", url, headers=headers, data=payload)
        data = json.loads(response.text)['result']
        request.session['listEstudiante'] = data
        data_estudiantes = request.session.get('listEstudiante')

        if not data_estudiantes:
            return HttpResponse("No hay estudiantes cargados", status=400)

        estudiantes = []
        for e in data_estudiantes['data']['estudiantes']:
            estudiantes.append({
                'carnet': e.get('identificacion'),
                'nombre': e.get('estudiante')
            })

        asistenciaCursos = request.session.get('asistenciaCursos')

        if not asistenciaCursos:
            return HttpResponse("No hay datos de asistencia", status=400)

        curso_data = next(
            (c for c in asistenciaCursos['asistencias'] if c.get('curso') == codigo_curso),
            None
        )

        curso = curso_data['curso']
        horario = curso_data['horario']
        user = request.user
        profesor = user.get_full_name() or user.username

        context = {
            'curso': curso,
            'profesor': profesor,
            'sede': 'Sede Central Presencial Remota',
            'horario': horario,
            'grupo': '11',
            'estudiantes': estudiantes,
        }

        html = render_to_string('Dashboard/Profesor/asistencia.html', context)
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'inline; filename="asistencia.pdf"'
        pisa.CreatePDF(html, dest=response)
        return response


def cambiar_color(request):
    if request.method == 'GET':
        color = request.GET.get("color")
        atributo = request.GET.get("atributo")
        cambiar_variable_css(atributo, color)
    return JsonResponse('Cambio correcto', safe=False)


def cambiar_variable_css(nombre_variable, nuevo_valor):
    ruta_archivo_css = 'Usuario/static/css/root.css'
    with open(ruta_archivo_css, 'r') as archivo_css:
        contenido_css = archivo_css.read()

    linea_anterior = f'{nombre_variable}:'
    inicio_linea = contenido_css.find(linea_anterior)

    if inicio_linea != -1:
        fin_linea = contenido_css.find(';', inicio_linea)
        nueva_linea = f'{nombre_variable}: {nuevo_valor};'
        contenido_css = contenido_css[:inicio_linea] + nueva_linea + contenido_css[fin_linea + 1:]

        with open(ruta_archivo_css, 'w') as archivo_css:
            archivo_css.write(contenido_css)
    else:
        print(f'La variable {nombre_variable} no se encontró en el archivo CSS.')


class CorreoP(LoginRequiredMixin, View):
    def correoP(request, type):
        user = request.user
        context = {
            'user': user,
            'type': type,
            'formulario': request.session.get('formulario', 'NA'),
        }
        return render(request, 'Dashboard/Profesor/envioCorreo.html', context)


class Certificaciones(LoginRequiredMixin, View):

    def certificaciones(request, type):
        url_api_erp = str(settings.URL_API_ERP)
        url = 'http://' + url_api_erp + '/get_docente_periodos'
        idProfesor = json.dumps({'identificacion': str(user.username)})
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.request("POST", url, headers=headers, data=idProfesor)
        data = json.loads(response.text)['result']
        cert = []
        for certi in data['data']['certificaciones']:
            cert.append(certi)
        user = request.user

        context = {
            'user': user,
            'type': type,
            'formulario': request.session.get('formulario', 'NA'),
            'certificacion': cert,
        }
        return render(request, 'Dashboard/Estudiante/certificaciones.html', context)


import pandas as pd


def carga_usuarios(request):
    archivo_excel = 'Usuario/EJEMPLO.xlsx'
    datos_excel = pd.read_excel(archivo_excel)
    for indice, fila in datos_excel.iterrows():
        # Accede a los valores de cada columna
        new_username = fila['username']
        new_password = fila['password']
        new_email = fila['email']
        new_first_name = fila['first_name']
        new_last_name = fila['last_name']
        role = fila['role']
        try:
            userMoodle = moodleUser.objects.get(identificacion=new_username)
            userMoodle.password = new_password
            userMoodle.save()
        except moodleUser.DoesNotExist:
            userMoodle = moodleUser(identificacion=new_username, password=new_password, act_datos=False)
            userMoodle.save()

        try:
            user = User.objects.get(username=new_username)
        except User.DoesNotExist:
            user = User.objects.create_user(username=new_username, email=new_email, password=new_password,
                                            first_name=new_first_name, last_name=new_last_name)
            if user is not None:
                dataU = [user.username, role]
                saveInGroup(request, dataU)
                if role == 'Estudiante':
                    datos_estados = [user.username, True, False, False]
                    save = save_profile_processes.save_user_status(request, datos_estados)
                    get_student_study(user.username)
    return render(request, 'Usuario/login.html')


class vistaPerfilTemp(LoginRequiredMixin):
    context_object_name = 'perfil_temp'
    template_name = 'Dashboard/Componentes/perfil_temp.html'

    def profile_view(request, **kwargs):
        user = request.user

        prospecto_dict = request.session.get('user_info')

        context = {
            'user': user,
            'estudiante': prospecto_dict,
            'type': kwargs['type']
        }

        context['primer_inicio'] = True

        return render(request, 'Dashboard/Componentes/perfil_temp.html', context)


@login_required
class EnvioSolicitudTemp(LoginRequiredMixin, View):
    context_object_name = 'envioSolicitudTemp'
    template_name = 'Dashboard/Componentes/perfil_temp.html'

    def enviar_solicitud(request):
        if request.method == 'POST':
            user = request.user
            try:
                data = json.loads(request.body.decode('utf-8'))

                fecha_nacimiento = data.get('fecha_nacimiento')
                colegio_procedencia = data.get('colegio_procedencia')
                fecha_graduacion = data.get('provincia')
                correo_personal = data.get('correo_personal')
                ingresoEconomico = data.get('ingresoEconomico')
                provincia = data.get('provincia')
                canton = data.get('canton')
                distrito = data.get('distrito')
                direccion_exacta = data.get('direccion')
                telefono = data.get('telefono')
                telefono2 = data.get('telefono2')

                data = {
                    "identificacion": user.username,
                    "fecha_nacimiento": fecha_nacimiento,
                    "colegio_procedencia": colegio_procedencia,
                    "fecha_graduacion": fecha_graduacion,
                    "correo_personal": correo_personal,
                    "ingresoEconomico": ingresoEconomico,
                    "numeroTelefono_Principal": telefono,
                    "numeroTelefono_secundario": telefono2,
                    "provincia_id": provincia,
                    "canton_id": canton,
                    "distrito_id": distrito,
                    "direccionExacta": direccion_exacta,
                }

                # userMoodle = moodleUser.objects.get(identificacion=user.username)
                # userMoodle.act_datos = True
                # userMoodle.save()

                set = set_estudiante_info(request, data)

                if set:
                    response_data = {'message': 'Los datos actualizados han sido enviados correctamente.'}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {
                        'message': 'Error en el envio de la solicitud. Por favor, ponte en contacto con el equipo de soporte técnico, soporte_tecnico@uia.ac.cr. Gracias.'}
                    return JsonResponse(response_data, status=400)

            except json.JSONDecodeError:
                response_data = {
                    'message': 'Error en el envio de la solicitud. Por favor, ponte en contacto con el equipo de soporte técnico, soporte_tecnico@uia.ac.cr. Gracias.'}
                return JsonResponse(response_data, status=400)
        else:
            response_data = {
                'message': 'Error en el envio de la solicitud. Por favor, ponte en contacto con el equipo de soporte técnico, soporte_tecnico@uia.ac.cr. Gracias.'}
            return JsonResponse(response_data, status=405)


def custom_password_reset(request):
    if request.method == 'POST':
        form = PasswordResetForm(request.POST)
        if form.is_valid():
            email_list = request.POST.getlist('email')
            if email_list:
                email = email_list[0]
                user = User.objects.get(email=email)
                token = default_token_generator.make_token(user)
                uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                reset_url = request.build_absolute_uri(reverse('password_reset_confirm', args=[uidb64, token]))
                subject = 'Restablecimiento de contraseña'
                message = render_to_string('Contrasenas/Correo/password_reset_email.html',
                                           {'reset_url': reset_url, 'user': user.username})
                to_email = [email]
                Correo.envioCorreos(correoSend=0, emailTo=to_email, emailCC=None, asunto=subject, mensaje=message,
                                    archivo=None)
                return render(request, 'Contrasenas/Correo/password_reset_done.html')
    else:
        form = PasswordResetForm()

    return render(request, 'Contrasenas/Correo/password_reset.html', {'form': form})


class cambioContrasenaMicrosoft(LoginRequiredMixin, View):
    context_object_name = 'password-change'
    template_name = 'Contrasenas/change-password-microsoft.html'

    def password_view(request):
        user = request.user
        context = {
            'user': user
        }
        return render(request, 'Contrasenas/change-password-microsoft.html', context)


@login_required
class cambioApiMicrosoft(LoginRequiredMixin):
    context_object_name = 'cambioApiMicrosoft'

    def api_cambio(request):
        user = request.session.get('user_info')
        tipo_pros = user["tipo"]
        context = {'type': tipo_pros}
        if request.method == 'POST':
            old_password = request.POST.get('old_password')
            new_password2 = request.POST.get('new_password2')

            access_token = request.session.get('access_token')

            url = 'https://graph.microsoft.com/v1.0/me/changePassword'

            headers = {
                'Authorization': 'Bearer ' + access_token,
                'Content-Type': 'application/json'
            }

            data_password = {
                'currentPassword': old_password,
                'newPassword': new_password2
            }

            payload = json.dumps(data_password)

            response = requests.post(url, headers=headers, data=payload)
            if response.status_code == 204:
                Correo.confirmacionCambioMicrosoft(request)
                return redirect(reverse('inicio', kwargs=context))
            else:
                return redirect(reverse('change_password_microsoft'))
        else:
            return redirect(request.META.get('HTTP_REFERER'))


@login_required
class redirectMoodle(LoginRequiredMixin):
    context_object_name = 'redirectMoodle'

    def redirect_moodle(request):
        url = "https://e-campus.uia.ac.cr/webservice/rest/server.php?wstoken=264a1067ecfa3823f3a1821cbbb1e499&wsfunction=local_apiloginserviceexternal&moodlewsrestformat=json"
        user = request.user
        username = user.username
        userMoodle = moodleUser.objects.get(identificacion=username)
        password = userMoodle.password
        password_encoded = urllib.parse.quote(password)
        payload = 'username={}&password={}'.format(username, password_encoded)
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        response = requests.request("POST", url, headers=headers, data=payload)

        if response.status_code == 200:
            response_json = response.json()
            token = response_json.get("token")
            encoded_password = base64.b64encode(password.encode('utf-8')).decode('utf-8')
            return redirect(
                'https://e-campus.uia.ac.cr/local/loginsa/loginsa.php?token={}&privatetoken={}'.format(token,
                                                                                                       encoded_password))


@login_required
class mobileMenu(LoginRequiredMixin):
    context_object_name = 'mobileMenu'
    template_name = 'Dashboard/Estudiante/mobile.html'

    def menu_view(request, **kwargs):
        user = request.user

        prospecto_dict = request.session.get('user_info')

        context = {
            'user': user,
            'estudiante': prospecto_dict,
            'username': (user.first_name).title(),
            'type': kwargs['type']
        }

        return render(request, 'Dashboard/Estudiante/mobile.html', context)


@login_required
class redirectOneDrive(LoginRequiredMixin):
    context_object_name = 'redirectOneDrive'

    def redirect_onedrive(request):
        access_token = request.session.get('access_token')

        onedrive_url = "https://uiacr-my.sharepoint.com/"
        headers = {
            "Authorization": f"Bearer {access_token}"
        }

        return redirect(onedrive_url, headers=headers)


@login_required
class redirectOutlook(LoginRequiredMixin):
    context_object_name = 'redirectOutlook'

    def redirect_outlook(request):
        access_token = request.session.get('access_token')

        outlook_url = "https://outlook.office.com/"
        headers = {
            "Authorization": f"Bearer {access_token}"
        }

        return redirect(outlook_url, headers=headers)


def isWebView(request):
    isWebView = request.GET.get("isWV")
    if isWebView == "false":
        isWebView = False
    elif isWebView == "true":
        isWebView = True
    request.session['isWebView'] = isWebView
    request.session.save()
    dic = {
        'success': True
    }
    return JsonResponse(dic, safe=False)


def text_similarity(text1, text2):
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())

    common_words = words1.intersection(words2)

    similarity_index = len(common_words) / ((len(words1) + len(words2)) / 2)

    return similarity_index


def user_status_update(request):
    url_api_erp = str(settings.URL_API_ERP)
    url = f'http://{url_api_erp}/get_estudiante_status'
    user = request.user

    payload = json.dumps({
        "identificacion": user.username
    })

    headers = {
        'Content-Type': 'application/json'
    }

    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method'}, status=400)

    try:
        response = requests.get(url, headers=headers, data=payload)
        response.raise_for_status()
        json_response = response.json()
    except (requests.RequestException, json.JSONDecodeError):
        # Si falla el API o el JSON → continuar sin bloqueo
        json_response = {}

    # Obtener datos de forma segura
    data = json_response.get('result', {}).get('details', {}) or {}

    # Valores por defecto (cuando no viene nada)
    id_user = data.get('id')
    status = data.get('status', 'normal')
    moroso_documentos = data.get('moroso_documentos', False)
    morosidad_fina = data.get('morosidad_fina', False)

    # Si no viene nada → valor = False
    valor = bool(moroso_documentos or morosidad_fina)

    # Guardar solo si hay id
    if id_user:
        save_profile_processes.update_user_status(
            request,
            id_user,
            status,
            valor
        )

    # Guardar siempre en sesión (aunque sea False)
    request.session['documentos'] = moroso_documentos
    request.session['financiero'] = morosidad_fina

    return JsonResponse({
        'result': 'ok',
        'documentos': moroso_documentos,
        'financiero': morosidad_fina
    })