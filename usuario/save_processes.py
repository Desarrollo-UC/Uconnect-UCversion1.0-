from django.urls import reverse
from .forms import FormularioUrlsDspace, FormularioUserStatus, FormularioInclusivo, FormularioDocumentos, \
    FormularioPrimerIngreso, FormularioProspecto, CustomUserCreationForm
from django.contrib.auth.models import User, Group
from django.shortcuts import get_object_or_404
from django.contrib.auth import logout
from django.shortcuts import render, redirect
from .models import documentos, primerIngreso, prospecto, urls_dspace, user_status
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.core.exceptions import ObjectDoesNotExist


class save_profile_processes():

    def save_prospecto(request, data):
        form = FormularioProspecto(
            {'identificacion': data[0], 'tipo_identificacion': data[1], 'estado_migratorio': data[2], 'nombre': data[3],
             'primer_apellido': data[4],
             'segundo_apellido': data[5], 'fecha_nacimiento': data[6], 'numero_telefonico': data[7],
             'numero_telefonico2': data[8],
             'correo_institucional': data[9], 'correo_personal': data[10], 'nacionalidad': data[11],
             'provincia': data[12],
             'canton': data[13], 'distrito': data[14], 'direccion_exacta': data[15], 'sexo': data[16]})

        if form.is_valid():
            form.save()
            dataP = [data[0], 'Prospecto']
            saveInGroup(request, dataP)
            return True
        else:
            return False

    def save_inclusivo(reques, data):
        form = FormularioInclusivo(
            {'identificacion': data[0], 'sexo': data[1], 'trato': data[2]})

        if form.is_valid():
            form.save()
            return True
        else:
            return False

    def update_prospecto(request, data):
        user = request.user
        user = User.objects.get(email=user.email)
        user.email = data[8]
        user.save()
        prospecto_user = get_object_or_404(
            prospecto, identificacion=user.username)

        form = FormularioProspecto({'identificacion': data[0], 'nombre': data[1], 'primer_apellido': data[2],
                                    'segundo_apellido': data[3], 'fecha_nacimiento': data[4],
                                    'numero_telefonico': data[5], 'numero_telefonico2': data[6],
                                    'correo_institucional': data[7], 'correo_personal': data[8],
                                    'nacionalidad': data[9], 'provincia': data[10],
                                    'canton': data[11], 'distrito': data[12], 'direccion_exacta': data[13],
                                    'sexo': data[14]}, instance=prospecto_user)

        if form.is_valid():
            form.save()
            return True
        else:
            return False

    def save_documents(request, data_status, data_docs):
        form = FormularioPrimerIngreso({'estado': data_status[0],
                                        'convalidacion': data_status[1], 'comentario': data_status[2],
                                        'usuario': data_status[3]})

        if form.is_valid():
            form.save()

        form_doc = FormularioDocumentos({'usuario': data_docs[0], 'docTitulo': data_docs[1],
                                         'docTituloUniversitario': data_docs[2], 'docIdentificacion': data_docs[3],
                                         'docFotoPasaporte': data_docs[4], 'docMateriasAprobadas': data_docs[5],
                                         'docPlanEstudios': data_docs[6]})

        if form_doc.is_valid():
            form_doc.save()
            return True
        else:
            return False

    def update_documents(user_id, data_status, data_docs):
        statusgeneral = get_object_or_404(primerIngreso, usuario=user_id.pk)
        docs = get_object_or_404(documentos, usuario=user_id.pk)

        print(statusgeneral)
        print(docs)

        form = FormularioPrimerIngreso({'estado': data_status, 'convalidacion': statusgeneral.convalidacion,
                                        'comentario': "S/C", 'usuario': user_id.pk}, instance=statusgeneral)

        if form.is_valid():
            form.save()

        form = FormularioDocumentos({'usuario': user_id.pk, 'docTitulo': data_docs[1],
                                     'docTituloUniversitario': data_docs[2], 'docIdentificacion': data_docs[3],
                                     'docFotoPasaporte': data_docs[4], 'docMateriasAprobadas': data_docs[5],
                                     'docPlanEstudios': data_docs[6]}, instance=docs)

        if form.is_valid():
            form.save()
            return True
        else:
            return False

    def update_user_prospecto(id, email, group_name):
        try:
            user = User.objects.get(username=id)

            user.email = email
            user.is_active = True
            user.save()

            group, created = Group.objects.get_or_create(name=group_name)
            user.groups.clear()  # Elimina todos los grupos actuales del usuario
            user.groups.add(group)  # Añade el nuevo grupo al usuario

            return True
        except User.DoesNotExist:
            return False  # Manejo de error si el usuario no existe

    def save_user_status(request, data):
        form = FormularioUserStatus({'identificacion': data[0], 'activo': data[1], 'moroso': data[2],
                                     'terminos_condiciones': data[3]})

        if form.is_valid():
            form.save()
            return True
        else:
            return False

    def update_user_status(request, id, data, value):
        user_s, created = user_status.objects.get_or_create(
            identificacion=id,
            defaults={
                'activo': False,
                'moroso': False,
                'terminos_condiciones': False,
            }
        )

        status_map = {
            'activo': 'activo',
            'moroso': 'moroso',
            'Al día': 'moroso',
            'terminos': 'terminos_condiciones',
        }

        field = status_map.get(data)

        if field:
            setattr(user_s, field, value)
            user_s.save()
            return True

        return False

    def save_urls_dspace(request, urls):
        user = request.user
        form = FormularioUrlsDspace({
            'id_estudiante': user.username,
            'docTitulo': urls['docTitulo'],
            'docTituloUniversitario': urls['docTituloUniversitario'],
            'docIdentificacion': urls['docIdentificacion'],
            'docFotoPasaporte': urls['docFotoPasaporte'],
            'docMateriasAprobadas': urls['docMateriasAprobadas'],
            'docPlanEstudios': urls['docPlanEstudios']
        })

        if form.is_valid():
            form.save()
            return True
        else:
            return False

    # VERIFICAR
    def delete_urls_dspace(id):
        try:
            instancia = urls_dspace.objects.get(id_urls=id)
            instancia.delete()
            return True
        except urls_dspace.DoesNotExist:
            return False


def payment_update_user_prospecto(request):
    user = request.user
    user_info = request.session.get('user_info')

    periodos_varios = request.session.get('periodos_varios')

    if not periodos_varios:
        save_profile_processes.update_user_status(request, user.username, 'form', False)
        save_profile_processes.update_user_status(request, user.username, 'prematricula', False)
        save_profile_processes.update_user_status(request, user.username, 'matricula', False)

        if user_info['tipo'] == 'prospecto':

            user.is_active = False
            user.password = 'Admin1818$'
            user.save()

            user_prospecto = prospecto.objects.get(identificacion=user.username)
            user_prospecto.delete()

            user_prospecto_docs = get_object_or_404(documentos, usuario=user.pk)
            user_prospecto_docs.delete()

            user_prospecto_form = get_object_or_404(primerIngreso, usuario=user.pk)
            user_prospecto_form.delete()

            logout(request)
            return redirect('login')
        elif user_info['tipo'] == 'estudiante' or user_info['tipo'] == 'estudiante/profesor':
            context = {'type': user_info['tipo']}
            return redirect(reverse('inicio', kwargs=context))
    else:
        save_profile_processes.update_user_status(request, user.username, 'cursando', True)
        context = {'type': user_info['tipo']}
        return redirect(reverse('matricula', kwargs=context))


@csrf_exempt
def payment_update_user_prospecto_with_post(request):
    # Solo permite solicitudes POST
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method, only POST allowed'}, status=405)

    try:
        # Parsear los datos JSON del cuerpo de la solicitud
        data = json.loads(request.body)

        # Extraer los parámetros de la solicitud
        username = data.get('username')
        tipo = data.get('tipo')
        periodos_varios = data.get('periodos_varios')

        # Validar que los parámetros esenciales estén presentes
        if not username or not tipo:
            return JsonResponse({'error': 'Missing parameters'}, status=400)

        user = User.objects.filter(username=username).first()  # Devuelve None si no encuentra el usuario
        if not user:
            return JsonResponse({'message': 'User not found, no action performed'}, status=200)
        user_info = {'tipo': tipo}
        if user.password == 'Admin1818$':
            return JsonResponse({'message': 'User not found, no action performed'}, status=200)
        # Lógica de la función original, adaptada para los parámetros
        if not periodos_varios:
            save_profile_processes.update_user_status(request, user.username, 'form', False)
            save_profile_processes.update_user_status(request, user.username, 'prematricula', False)
            save_profile_processes.update_user_status(request, user.username, 'matricula', False)

            if user_info['tipo'] == 'prospecto':
                user.is_active = False
                user.password = 'Admin1818$'
                user.save()
                try:
                    user_prospecto = prospecto.objects.get(identificacion=user.username)
                    user_prospecto.delete()

                    user_prospecto_docs = get_object_or_404(documentos, usuario=user.pk)
                    user_prospecto_docs.delete()

                    user_prospecto_form = get_object_or_404(primerIngreso, usuario=user.pk)
                    user_prospecto_form.delete()

                    logout(request)
                    return JsonResponse({'message': 'User updated and logged out successfully'})
                except ObjectDoesNotExist:
                    return JsonResponse({'message': 'User not found, no action performed'}, status=200)

            elif user_info['tipo'] == 'estudiante' or user_info['tipo'] == 'estudiante/profesor':
                return JsonResponse({'message': f'Redirecting to inicio for {user_info["tipo"]}'})

        else:
            save_profile_processes.update_user_status(request, user.username, 'cursando', True)
            return JsonResponse({'message': 'User status updated to cursando'})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format in request body'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def saveInGroup(request, data):
    try:
        user = User.objects.get(username=data[0])
        group = Group.objects.get(name=data[1])
    except Group.DoesNotExist:
        group = Group.objects.create(name=data[1])

    group.user_set.add(user)
    return False