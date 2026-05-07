from django.http import JsonResponse
import json
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_protect
import base64
from .dspace_processes import dspace_processes
from .save_processes import save_profile_processes
from rest_framework.decorators import authentication_classes, permission_classes, api_view
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from .models import moodleUser, primerIngreso, user_status
from django.contrib.auth.models import User
import requests
import json
from django.conf import settings

@csrf_protect
@api_view(['POST'])
@permission_classes([AllowAny])
def login_api_sa(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if username is None or password is None:
        return Response({'error': 'Se requiere nombre de usuario y contraseña'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)

    if not user:
        return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

    Token.objects.filter(user=user).delete()

    token = Token.objects.create(user=user)

    # Iniciar sesión en Django para el usuario autenticado (opcional)
    # django_login(request, user)

    return Response({'token': token.key})

@csrf_protect
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout_api_sa(request):
    # Obtenemos el token del usuario autenticado
    token = Token.objects.get(user=request.user)

    # Eliminamos el token
    token.delete()

    return Response({'detail': 'Sesión cerrada exitosamente'}, status=status.HTTP_200_OK)

@api_view(['POST'])
def documents_status(request):
    # https://campus.uia.ac.cr/documents-status/
    
    # {
    #     "data": {
    #         "id": 117580049,     
    #         "docTitulo": Aprobado,
    #         "docTituloUniversitario": Aprobado,
    #         "docIdentificacion": Rechazado,
    #         "docFotoPasaporte": Rechazado,
    #         "docMateriasAprobadas": N/A,
    #         "docPlanEstudios": N/A
    #     }
    # }
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            id_value = data['id']
            print(data)
            user_id = User.objects.get(username = id_value)
            del data['id']
        
            docTitulo = data['docTitulo']
            docTituloUniversitario = data['docTituloUniversitario']
            docIdentificacion = data['docIdentificacion']
            docFotoPasaporte = data['docFotoPasaporte']
            docMateriasAprobadas = data['docMateriasAprobadas']
            docPlanEstudios = data['docPlanEstudios']
            status_value = False
            
            for key, value in data.items():
                print('dentro')
                if value == 'Rechazado':
                    status_value = True
            
            if status_value:
                status_result = 'Correccion'
            else:
                status_result = 'Aprobado'
            
            data_documents = [id_value, docTitulo, docTituloUniversitario, docIdentificacion, docFotoPasaporte, docMateriasAprobadas, docPlanEstudios]
            
            save = save_profile_processes.update_documents(user_id, status_result, data_documents)
            
            if save:
                # Procesar los datos y generar la respuesta en JSON
                response_data = {'result': 'ok'}
                return JsonResponse(response_data, status=200)
            else:
                response_data = {'error': 'Invalid request method'}
                return JsonResponse(response_data, status=400)
            
        except KeyError:
            response_data = {'error': 'Invalid request method'}
            return JsonResponse(response_data, status=400)
    else:
        # Si la petición no es POST, devuelve un error
        response_data = {'error': 'Invalid request method'}
        return JsonResponse(response_data, status=400)
    
@api_view(['POST'])
def user_update(request):
    # https://campus.uia.ac.cr/user-update/
    
    # {
    #     "data": {
    #         "id": 117580049,
    #         "docFotoPasaporte": "archivo",
    #         "docTitulo": "archivo",
    #         "docTituloUniversitario": "archivo",
    #         "docIdentificacion": "archivo",
    #         "docMateriasAprobadas": "archivo",
    #         "docPlanEstudios": "archivo"     
    #     }
    # }
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            id_value = data['id']
            
            # Procesar los datos y generar la respuesta en JSON
            user_s = get_object_or_404(user_status, identificacion=id_value)
                
            user_auth = get_object_or_404(User, username=id_value)
                
            user_conv = primerIngreso.objects.get(usuario=user_auth.pk)
                
            user_conv.estado = 'Aprobado'
                
            user_conv.save()
            
            if '/' in user_s.form:
                users_form = (user_s.form).split('/')
                if users_form.length() < 3:
                    if users_form[1] == 'PI':
                        tipoForm = 'PRIMER INGRESO'
                    elif users_form[1] == 'PP':
                        tipoForm = 'POSGRADOS'
                    elif users_form[1] == 'CL':
                        tipoForm = 'CURSOS LIBRES'
                    elif users_form[1] == 'MM':
                        tipoForm = 'MICROMASTER'
                    elif users_form[1] == 'TC':
                        tipoForm = 'TECNICOS'
            else:
                if user_s.form == 'PI':
                    tipoForm = 'PRIMER INGRESO'
                elif user_s.form == 'PP':
                    tipoForm = 'POSGRADOS'
                elif user_s.form == 'CL':
                    tipoForm = 'CURSOS LIBRES'
                elif user_s.form == 'MM':
                    tipoForm = 'MICROMASTER'
                elif user_s.form == 'TC':
                    tipoForm = 'TECNICOS'
                    
            del data["id"]
                    
            files = {}
                
            for key, value in data.items():
                if value is not None:
                    files[key] = base64.b64decode(value)
                
            files_updated = dspace_processes.name_standardization(request, files)
        
            dspace_processes.dspace_first_admission(request, files_updated, tipoForm)
                
            save_profile_processes.update_user_status(request, id_value, 'matricula', True)
            response_data = {'result': 'ok'}
            return JsonResponse(response_data, status=200)
            
        except KeyError:
            response_data = {'error': 'Invalid request method'}
            return JsonResponse(response_data, status=400)
    else:
        # Si la petición no es POST, devuelve un error
        response_data = {'error': 'Invalid request method'}
        return JsonResponse(response_data, status=400)
  
@api_view(['POST'])
def user_status_form(request):
    # https://campus.uia.ac.cr/user-status-form/
    
    # {
    #     "data": {
    #         "id": 117580049,     
    #         "status": Prospecto/Atendido/Califica para Matrícula/Agenda Matrícula/Pre Matrícula Precencial
    #           /Pre Matrícula Online/Matriculado,
    #     }
    # }
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print (data)
            id_value = data['id']
            status = data['status']
            print(id_value)
            user_id = User.objects.get(username = id_value)
            user = primerIngreso.objects.get(usuario = user_id)
            user.estado = status
            user.save()
            if status == 'Pre Matrícula Precencial' or status == 'Pre Matrícula Online':
                user_status_update = user_status.objects.get(identificacion = id_value)
                user_status_update.prematricula = True
                user_status_update.save()
            response_data = {'success': 'Valid request method'}
            return JsonResponse(response_data, status=200)
        except KeyError:
            response_data = {'error': 'Invalid request method'}
            return JsonResponse(response_data, status=400)
    else:
        # Si la petición no es POST, devuelve un error
        response_data = {'error': 'Invalid request method'}
        return JsonResponse(response_data, status=400)
    
  
@api_view(['POST'])
def solicitud_form(request):
    #http://192.168.8.136:8000/solicitud-form/
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            response_data = {'error': 'Invalid JSON'}
            return JsonResponse(response_data, status=400)
            
        try:
            if data is not None:
                print (data)
                # Procesar los datos y generar la respuesta en JSON
                response_data = {'result': 'ok'}
                return JsonResponse(response_data)
            else:
                response_data = {'error': 'Invalid request method'}
                return JsonResponse(response_data, status=400)
            
        except KeyError:
            response_data = {'error': 'Invalid request method'}
            return JsonResponse(response_data, status=400)
    else:
        # Si la petición no es POST, devuelve un error
        response_data = {'error': 'Invalid request method'}
        return JsonResponse(response_data, status=400)
    
@api_view(['POST'])
def user_status_update(request):
    url_api_erp = str(settings.URL_API_ERP)
    url = 'http://'+ url_api_erp +'/get_estudiante_status'
    user = request.user
    payload = json.dumps({
        "identificacion": user.username
    })
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    
    # {
    #     "data": {
    #         "id": 117580049,
    #         "status": "moroso",
    #         "valor": True
    #     }
    # }
    if request.method == 'POST':
        try:
            response = requests.request("GET", url, headers=headers, data=payload)
            data = json.loads(response.text)['details']
        except json.JSONDecodeError:
            response_data = {'error': 'Invalid JSON'}
            return JsonResponse(response_data, status=400)
            
        try:
            id_user = data['id']
            status = data['status']
            valor = True if data['morosidad_fina'] or data['moroso_documentos'] else False
            
            save = save_profile_processes.update_user_status(request, id_user, status, valor)
            
            if save:
                # Procesar los datos y generar la respuesta en JSON
                response_data = {
                    'result': 'ok',
                    'documentos': data['moroso_documentos'],
                    'financiero': data['morosidad_fina']
                    }
                return JsonResponse(response_data)
            else:
                response_data = {'error': 'Invalid request method'}
                return JsonResponse(response_data, status=400)
            
        except KeyError:
            response_data = {'error': 'Invalid request method'}
            return JsonResponse(response_data, status=400)
    else:
        # Si la petición no es POST, devuelve un error
        response_data = {'error': 'Invalid request method'}
        return JsonResponse(response_data, status=400)

@api_view(['POST'])
def user_activate(request):
    #http://192.168.8.136:8000/user-status/
    
    # {
    #     "data": {
    #         "identificacion": 117580049,
    #         "email": "email@institucional.com",
    #         "password": "MoodlePassword",
    #     }
    # }
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            response_data = {'error': 'Invalid JSON'}
            return JsonResponse(response_data, status=400)
            
        try:
            id_user = data['identificacion']
            email = data['email']
            user = User.objects.get(username=id_user)
            user.email = email
            user.is_active = True
            user.save()
            
            userMoodle = moodleUser(identificacion=user.username, password=data['password'])
            userMoodle.save()
            
            response_data = {'result': 'ok'}
            return JsonResponse(response_data)
            
        except KeyError:
            response_data = {'error': 'Invalid request method'}
            return JsonResponse(response_data, status=400)
    else:
        # Si la petición no es POST, devuelve un error
        response_data = {'error': 'Invalid request method'}
        return JsonResponse(response_data, status=400)