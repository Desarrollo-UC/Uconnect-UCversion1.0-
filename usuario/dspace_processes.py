import requests
import json
from django.contrib.auth.models import User
from datetime import date

from .save_processes import save_profile_processes
from usuario import save_processes

class dspace_processes():
    
    def dspace_first_admission(request, files, typeuser):
        session = requests.Session()
        user = request.user
        user = User.objects.get(username=user.username)
        user_data = request.session.get('user_info')
        
        # Obtener el token CSRF
        csrf_url = 'http://repositorio.uia.ac.cr:8080/server/api/authn'
        csrf_response = session.get(csrf_url)
        if csrf_response.status_code == 200:
            csrf_token = csrf_response.cookies.get('DSPACE-XSRF-COOKIE')
            print('Token de CSRF:', csrf_token)
        else:
            print('Error al obtener el token de CSRF')
            
        # Autenticarse con DSpace utilizando el token CSRF
        auth_url = 'http://repositorio.uia.ac.cr:8080/server/api/authn/login'
        username = 'jlopezm@uia.ac.cr'
        password = 'Admin1818'
        data = {"user": username, "password": password}
        headers = {"X-XSRF-TOKEN": csrf_token}
        response = session.post(auth_url, data=data, headers=headers)

        if response.status_code == 200:
            token = response.headers.get('Authorization')
            csrf_token_login = response.cookies.get('DSPACE-XSRF-COOKIE')
            print('Token de autenticación:', token)
        else:
            print('Error de autenticación')
            
        collection_id = "6d7701d9-f605-4b5c-911e-3bf9ef743dde"

        # Creacion de ITEM en coleccion determinada
        headers = {
            'Content-Type': 'application/json',
            "Authorization": token,
            "X-XSRF-TOKEN": csrf_token_login
        }
        upload_url = "http://repositorio.uia.ac.cr:8080/server/api/core/items?owningCollection="+collection_id
        fecha_actual = date.today()
        metadata = {
            "name": "User",
            "metadata": {
                "dc.title": [{"value": user_data['identificacion']}],
                "dc.contributor.author": [{"value": user_data['nombre'] +" "+ user_data['primer_apellido'] +" "+ user_data['segundo_apellido']}],
                "dc.date.issued": [{"value": fecha_actual.strftime('%Y-%m-%d')}],
                "dc.publisher": [{"value": "Soñador"}]
            },
            "inArchive": True,
            "discoverable": True,
            "withdrawn": False,
            "type": "item"
        }
        response = session.post(upload_url, data=json.dumps(metadata), headers=headers)
        if response.status_code == 201:
            print('Archivo enviado con éxito')
            response_json = response.json()
            item_id = response_json['id']
        else:
            print('Error al enviar el archivo')
        
        #Creacion de BUNDLE dentro de ITEM creado anteriormente
        bundle = {
            "name": typeuser,
            "metadata": {
            }
        }
        headers = {  
            'Content-Type': 'application/json',
            "Authorization": token,
            "X-XSRF-TOKEN": csrf_token_login
        }
        upload_url = "http://repositorio.uia.ac.cr:8080/server/api/core/items/"+item_id+"/bundles"
        response = session.post(upload_url, headers=headers, data=json.dumps(bundle))
        if response.status_code == 201:
            print('Archivo enviado con éxito')
            response_json = response.json()
            bundle_id = response_json['uuid']
        else:
            print('Error al enviar el archivo')
            
        #Creacion de BITSTREAMS dentro de BUNDLE creado anteriormente
        
        headers = {  
            "Authorization": token,           
            "X-XSRF-TOKEN": csrf_token_login,
        }
        
        urls_dspace = {}
        
        for dt in files:
            record = files[dt]
            file_processed = record['archivo']
            data = {
                f'properties': '{ "name": "'+record['nombre']+'", "metadata": { "dc.description": [ { "value": "'+record['descripcion']+'", "language": null, "authority": null, "confidence": -1, "place": 0 }]}, "bundleName": "PRIMER_INGRESO" }'
            }
            
            data_file = {'file':(record['nombre'], file_processed, record['tipo'])}
    
            upload_url = "http://repositorio.uia.ac.cr:8080/server/api/core/bundles/"+bundle_id+"/bitstreams"
            response = session.post(upload_url, headers=headers, data=data, files=data_file)
            if response.status_code == 201:
                print('Archivo enviado con éxito')
                response_json = response.json()
                bitstreams_id = response_json['id']
                
                urls_dspace[record['nombre']] = 'http://repositorio.uia.ac.cr:8080/server/api/core/bitstreams/'+bitstreams_id+'/content'
            else:
                print('Error al enviar el archivo')
        
        # Cierre de sesión
        logout_url = 'http://repositorio.uia.ac.cr:8080/server/api/authn/logout'

        response = session.post(logout_url, headers=headers)

        if response.status_code == 204:
            if 'docFotoPasaporte' not in urls_dspace:
                urls_dspace['docFotoPasaporte'] = 'N/A'
            if 'docTitulo' not in urls_dspace:
                urls_dspace['docTitulo'] = 'N/A'
            if 'docTituloUniversitario' not in urls_dspace:
                urls_dspace['docTituloUniversitario'] = 'N/A'
            if 'docMateriasAprobadas' not in urls_dspace:
                urls_dspace['docMateriasAprobadas'] = 'N/A'
            if 'docPlanEstudios' not in urls_dspace:
                urls_dspace['docPlanEstudios'] = 'N/A'
            save_profile_processes.save_urls_dspace(request, urls_dspace)
            return True
        else:
            print('Error al cerrar la sesión')
   
    #SIN USO POR ACTUALIZACION DE PROCESO     
    '''
    def dspace_file_correction(request, file, file_name):
        session = requests.Session()
        user = request.user
        user = User.objects.get(username=user.username)
        
        # Obtener el token CSRF
        csrf_url = 'http://repositorio.uia.ac.cr:8080/server/api/authn'
        csrf_response = session.get(csrf_url)
        if csrf_response.status_code == 200:
            csrf_token = csrf_response.cookies.get('DSPACE-XSRF-COOKIE')
            print('Token de CSRF:', csrf_token)
        else:
            print('Error al obtener el token de CSRF')
            
        # Autenticarse con DSpace utilizando el token CSRF
        auth_url = 'http://repositorio.uia.ac.cr:8080/server/api/authn/login'
        username = 'jlopezm@uia.ac.cr'
        password = 'Admin1818'
        data = {"user": username, "password": password}
        headers = {"X-XSRF-TOKEN": csrf_token}
        response = session.post(auth_url, data=data, headers=headers)

        if response.status_code == 200:
            token = response.headers.get('Authorization')
            csrf_token_login = response.cookies.get('DSPACE-XSRF-COOKIE')
            print('Token de autenticación:', token)
        else:
            print('Error de autenticación')
            
        collection_id = "6d7701d9-f605-4b5c-911e-3bf9ef743dde"
        
        # Obtencion de ITEM en coleccion determinada
        headers = {
            "Authorization": token,
            "X-XSRF-TOKEN": csrf_token_login
        }
        upload_url = "http://repositorio.uia.ac.cr:8080/server/api/core/items"
        response = session.get(upload_url, headers=headers)
        items = json.loads(response.text)
        item_id = ""
        for item in items['_embedded']['items']:
            if item['name'] == user.username:
                item_id = item['uuid']
                break
            
        # Obtencion de BUNDLE en coleccion determinada
        bundle_url = "http://repositorio.uia.ac.cr:8080/server/api/core/items/"+item_id+"/bundles"
        response = session.get(bundle_url, headers=headers)
        bundles = json.loads(response.text)
        bundle_id = ""
        for bundle in bundles['_embedded']['bundles']:
            if bundle['name'] == 'PRIMER_INGRESO':
                bundle_id = bundle['uuid']
                break
            
        # Obtencion de BITSTREAM en bundle determinada
        bitstream_url = "http://repositorio.uia.ac.cr:8080/server/api/core/bundles/"+bundle_id+"/bitstreams"
        response = session.get(bitstream_url, headers=headers)
        bitstreams = json.loads(response.text)
        bitstream_id = ""
        for bitstream in bitstreams['_embedded']['bitstreams']:
            if file_name in bitstream['name']:
                bitstream_id = bitstream['uuid']
                break
            
        # Eliminacion de BITSTREAM en bundle determinada
        bitstream_url = "http://repositorio.uia.ac.cr:8080/server/api/core/bitstreams/"+bitstream_id
        response = session.delete(bitstream_url, headers=headers)
        if response.status_code == 204:
            print('Se elimino exitosamente')
        else:
            print('Error al eliminar')
        
        # Ingresar nuevo BITSTREAM en bundle determinada
        for dt in file:
            record = file[dt]
            file_processed = record['archivo']
            data = {
                f'properties': '{ "name": "'+record['nombre']+'", "metadata": { "dc.description": [ { "value": "'+record['descripcion']+'", "language": null, "authority": null, "confidence": -1, "place": 0 }]}, "bundleName": "PRIMER_INGRESO" }'
            }
                
            data_file = {'file':(record['nombre'], file_processed, record['tipo'])}
    
        upload_url = "http://repositorio.uia.ac.cr:8080/server/api/core/bundles/"+bundle_id+"/bitstreams"
        response = session.post(upload_url, headers=headers, data=data, files=data_file)
        if response.status_code == 201:
            print('Archivo enviado con éxito')
            response_json = response.json()
            bitstreams_id = response_json['id']
            url = 'http://repositorio.uia.ac.cr:8080/server/api/core/bitstreams/'+bitstreams_id+'/content'
            
            # save_profile_processes.update_urls_dspace(user.username, file_name, url)
        else:
            print('Error al enviar el archivo')
                
        # Cierre de sesión
        logout_url = 'http://repositorio.uia.ac.cr:8080/server/api/authn/logout'

        response = session.post(logout_url, headers=headers)

        if response.status_code == 204:
            print('Sesión cerrada exitosamente')
            return True
        else:
            print('Error al cerrar la sesión')
    '''
    def dspace_docs_visualization(data_url):
        session = requests.Session()
        
        # Obtener el token CSRF
        csrf_url = 'http://repositorio.uia.ac.cr:8080/server/api/authn'
        csrf_response = session.get(csrf_url)
        if csrf_response.status_code == 200:
            csrf_token = csrf_response.cookies.get('DSPACE-XSRF-COOKIE')
            print('Token de CSRF:', csrf_token)
        else:
            print('Error al obtener el token de CSRF')
            
        # Autenticarse con DSpace utilizando el token CSRF
        auth_url = 'http://repositorio.uia.ac.cr:8080/server/api/authn/login'
        username = 'jlopezm@uia.ac.cr'
        password = 'Admin1818'

        data = {"user": username, "password": password}
        headers = {"X-XSRF-TOKEN": csrf_token}
        response = session.post(auth_url, data=data, headers=headers)

        if response.status_code == 200:
            token = response.headers.get('Authorization')
            csrf_token_login = response.cookies.get('DSPACE-XSRF-COOKIE')
            print('Token de autenticación:', token)
        else:
            print('Error de autenticación')
            
        headers = {
            "Authorization": token,
            "X-XSRF-TOKEN": csrf_token_login
        }
        data_content = []
        campos = [field.name for field in data_url._meta.fields]
        if campos:
            primer_campo = campos.pop(0)
            primer_campo = campos.pop(0)
        for campo in campos:
            upload_url = getattr(data_url, campo)
            if upload_url != 'N/A':
                response = session.get(upload_url, headers=headers)
                if response.status_code == 200:
                    print('Archivo enviado con éxito')
                    data_content.append(response)
                else:
                    print('Error al enviar el archivo')
        return data_content
   
    def name_standardization(request, files_dict):
        user = request.user
        files_updated = {}
        for key, value in files_dict.items():
            file_collect = {}
            
            file = value.name
            file_termination = file.split(".")
            new_name_file = key +'_'+ user.username +'.'+ file_termination[1]
            file_collect['nombre'] = new_name_file
            file_collect['archivo'] = value
            file_collect['tipo'] = value.content_type
            
            if key == 'docFotoPasaporte':
                file_collect['descripcion'] = 'Foto de Perfil Tipo Pasaporte'
            if key == 'docTitulo':
                file_collect['descripcion'] = 'Título de Educación Media'
            if key == 'docTituloUniversitario':
                file_collect['descripcion'] = 'Título Universitario'
            if key == 'docIdentificacion':
                file_collect['descripcion'] = 'Identificación'
            if key == 'docMateriasAprobadas':
                file_collect['descripcion'] = 'Record Academico o certificado de Notas del Curso'
            if key == 'docPlanEstudios':
                file_collect['descripcion'] = 'Plan de Estudio - Contenido del Curso'
            
            files_updated[key] = file_collect
        
        return files_updated
    
    def name_file_correction_standardization(request, file, type):
        user = request.user
        
        file_type = file.name
        file_termination = file_type.split(".")
        
        if type == 'tituloeducacion':
            new_file = 'tituloeducacion_'+ user.username +'.'+ file_termination[1]
        elif type == 'identificacion':
            new_file = 'identificacion_'+ user.username +'.'+ file_termination[1]
        elif type == 'fotoperfil':
            new_file = 'fotoperfil_'+ user.username +'.'+ file_termination[1]
        elif type == 'record_academico':
            new_file = 'record_academico_'+ user.username +'.'+ file_termination[1]
        elif type == 'plan_estudio':
            new_file = 'plan_estudio_'+ user.username +'.'+ file_termination[1]
        
        file_updated = {
            'file': {
                'nombre': new_file,
                'archivo': file,
                'descripcion': 'Título de Educación Media',
                'tipo': file.content_type
            }
        }
    
        return file_updated
    
    def content_process(data):
        if 'pdf' in data:
            return 'pdf'
        elif 'jpeg' in data:
            return 'jpeg'
        elif 'png' in data:
            return 'png'