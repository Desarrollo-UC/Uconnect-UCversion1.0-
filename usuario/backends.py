from django.shortcuts import get_object_or_404
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import User
import requests
from .api_queries import get_professor, get_status_student, get_student, get_student_study, enviarActualizar
from .models import prospecto
from .save_processes import save_profile_processes, saveInGroup
import logging

logger = logging.getLogger('django')


class MicrosoftGraphBackend(BaseBackend):
    @staticmethod
    def authenticate(request, access_token=None):
        if not access_token:
            return None

        if 'user_info' in request.session:
            del request.session['user_info']
        # Obtener información del usuario utilizando Microsoft Graph API
        url = 'https://graph.microsoft.com/v1.0/me'
        headers = {'Authorization': 'Bearer ' + access_token}
        response = requests.get(url, headers=headers)
        # Inicia sesión en la aplicación utilizando el nuevo usuario
        if response.status_code != 200:
            return None
        else:
            # Analizar la respuesta JSON
            user_data = response.json()
            email = user_data.get('mail').strip()
            tipo_user = user_data.get('jobTitle').strip()
            id_user = user_data.get('officeLocation').strip()
            if user_data.get('jobTitle') and user_data.get('officeLocation'):
                if user_data.get('jobTitle') == 'Docente':
                    dataD = enviarActualizar(email)
                    tipo_user = dataD["puesto"]
                    id_user = dataD["identificacion"] if dataD["identificacion"] else id_user
                else:
                    tipo_user = user_data.get('jobTitle').strip()
                    id_user = user_data.get('officeLocation').strip()

            if not email:
                return None

            # Buscar o crear un usuario utilizando la dirección de correo electrónico
            try:
                user = User.objects.get(username=id_user)
                dic = {
                    'primer_inicio': False,
                    'user': user,
                    'tipo': tipo_user
                }
                if user is not None:
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                    # ACTUALIZAR EL EMAIL EN CASO DE PRIMER INGRESO DE PROSPECTO QUE ES NUEVO ESTUDIANTE
                    if user.email != email:
                        save_profile_processes.update_user_prospecto(id_user, email, tipo_user)

                    if tipo_user == 'Estudiante':
                        estudiante_usuario = get_student(id_user)
                        estudiante_usuario["tipo"] = "estudiante"
                        request.session['user_info'] = estudiante_usuario
                    elif tipo_user == 'Docente':
                        profesor_usuario = get_professor(id_user)
                        try:
                            prospecto_user = get_object_or_404(prospecto, identificacion=id_user)
                            if prospecto_user is not None:
                                profesor_usuario["tipo"] = "estudiante/profesor"
                        except:
                            profesor_usuario["tipo"] = "profesor"
                        request.session['user_info'] = profesor_usuario
                    elif tipo_user == 'Docente y Estudiante':
                        profesor_usuario = get_professor(id_user)
                        profesor_usuario["tipo"] = "estudiante/profesor"
                        request.session['user_info'] = profesor_usuario

                    dic['user'] = User.objects.get(username=id_user)
                    return dic
            except User.DoesNotExist:
                # Si el usuario no existe, crear uno nuevo
                name = user_data.get('givenName')
                lastname = user_data.get('surname')

                datos_estados = [id_user, True, False, False]

                # Busqueda de usuario
                if tipo_user == 'Estudiante':
                    estudiante_usuario = get_student(id_user)
                    name = name if name else estudiante_usuario['nombre']
                    lastname = lastname if lastname else estudiante_usuario['primer_apellido'] + " " + estudiante_usuario['segundo_apellido']
                    user = User.objects.create_user(username=id_user, email=email, first_name=name, last_name=lastname)
                    if user is not None:
                        dic = {
                            'primer_inicio': True,
                            'user': user,
                            'tipo': "Estudiante"
                        }
                        # Guarda el nombre completo del usuario en el perfil de usuario
                        # Almacenar la información en la sesión del usuario
                        request.session['user_info'] = estudiante_usuario
                        estudiante_usuario["tipo"] = "estudiante"
                        user.backend = 'django.contrib.auth.backends.ModelBackend'
                        dataE = [id_user, 'Estudiante']
                        saveInGroup(request, dataE)
                        save_profile_processes.save_user_status(request, datos_estados)
                        get_status_student(request, id_user)
                        get_student_study(estudiante_usuario.get('identificacion'))
                        return dic
                elif tipo_user == 'Docente':
                    profesor_usuario = get_professor(id_user)
                    user = User.objects.create_user(username=id_user, email=email, first_name=name, last_name=lastname)
                    if user is not None:

                        dic = {
                            'primer_inicio': True,
                            'user': user,
                            'tipo': "Docente"
                        }
                        # Guarda el nombre completo del usuario en el perfil de usuario
                        try:
                            prospecto_user = get_object_or_404(prospecto, identificacion=id_user)
                            if prospecto_user is not None:
                                profesor_usuario["tipo"] = "prospecto/profesor"
                        except:
                            profesor_usuario["tipo"] = "profesor"
                        request.session['user_info'] = profesor_usuario
                        user.backend = 'django.contrib.auth.backends.ModelBackend'
                        dataP = [id_user, 'Docente']
                        saveInGroup(request, dataP)
                        return dic
                elif tipo_user == 'Docente y Estudiante':
                    profesor_usuario = get_professor(id_user)
                    user = User.objects.create_user(username=profesor_usuario.get('identificacion'), email=email,
                                                    first_name=name, last_name=lastname)
                    if user is not None:
                        dic = {
                            'primer_inicio': True,
                            'user': user,
                            'tipo': "Docente y Estudiante"
                        }
                        # Guarda el nombre completo del usuario en el perfil de usuario
                        profesor_usuario["tipo"] = "estudiante/profesor"
                        request.session['user_info'] = profesor_usuario
                        user.backend = 'django.contrib.auth.backends.ModelBackend'
                        dataPE = [id_user, 'Docente y Estudiante']
                        saveInGroup(request, dataPE)
                        save_profile_processes.save_user_status(request, datos_estados)
                        # get_student_study(profesor_usuario.get('identificacion'))
                        return dic