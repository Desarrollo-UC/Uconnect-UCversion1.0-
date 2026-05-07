from click import Group
from django.http import JsonResponse
import requests
from django.shortcuts import render, redirect, get_object_or_404
from django.conf import settings
from usuario.save_processes import save_profile_processes
from .models import *
import json
from django.contrib.auth.models import User
import time


def obtener_provincia(request):
    # url = 'https://ubicaciones.paginasweb.cr/provincias.json'
    # response = requests.get(url)
    # data = response.json()
    # print(data)
    # return JsonResponse(data, safe=False)

    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/get_provincia/'
    data = {}
    new_header = {
        'Content-Type': 'application/json'
    }

    response = requests.get(url, headers=new_header, data=json.dumps(data))
    data = response.json()
    return JsonResponse(data['result']['data'], safe=False)


def obtener_canton(request):
    id = request.GET.get("provincia_select")
    data = {
        'provincia_id': id
    }
    new_header = {
        'Content-Type': 'application/json'
    }
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/get_canton/'
    response = requests.get(url, headers=new_header, data=json.dumps(data))
    data = response.json()
    return JsonResponse(data['result']['data'], safe=False)


def obtener_distrito(request):
    id_provincia = request.GET.get("provincia_select")
    id_canton = request.GET.get("canton_select")
    data = {
        'canton_id': id_canton,
    }
    new_header = {
        'Content-Type': 'application/json'
    }
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/get_distrito/'
    response = requests.get(url, headers=new_header, data=json.dumps(data))
    data = response.json()
    return JsonResponse(data['result']['data'], safe=False)


def obtener_nacionalidad(request):
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/get_paises/'
    data = {}
    new_header = {
        'Content-Type': 'application/json'
    }

    response = requests.get(url, headers=new_header, data=json.dumps(data))
    data = response.json()
    return JsonResponse(data['result']['data'], safe=False)


def obtener_datos(request):
    identificacion = request.GET.get("identificacion", "").strip()

    if not identificacion or not identificacion.isdigit():
        return JsonResponse([], safe=False)

    if 9 <= len(identificacion) <= 12:
        url = f'https://api.hacienda.go.cr/fe/ae?identificacion={identificacion}'
        try:
            response = requests.get(url, timeout=5)
            if response.status_code != 200:
                return JsonResponse([], safe=False)

            data_usuario = response.json()
            tipo_ident = data_usuario.get("tipoIdentificacion")
            nombre_completo = data_usuario.get("nombre")

            request.session["tipoIdentificacion"] = tipo_ident

            if len(identificacion) == 9 and nombre_completo:
                partes = nombre_completo.split()

                if len(partes) >= 3:
                    nombre = ' '.join(partes[:-2]).title()
                    primer_apellido = partes[-2].title()
                    segundo_apellido = partes[-1].title()
                    data = [nombre, primer_apellido, segundo_apellido]
                else:
                    data = []
            elif 10 <= len(identificacion) <= 12:
                data = ["Existe"] if nombre_completo else []
            else:
                data = []

        except (requests.RequestException, ValueError, KeyError) as e:
            print(f"Error al consultar API de Hacienda: {e}")
            data = []

    else:
        data = []

    return JsonResponse(data, safe=False)


def obtener_fecha_unix(request):
    fecha_actual = int(time.time())
    request.session["timePy"] = fecha_actual
    return fecha_actual


def enviarActualizar(correo):
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/get_docente_actualizar/'
    data = {
        'correo': correo
    }
    new_header = {
        'Content-Type': 'application/json'
    }

    response = requests.get(url, headers=new_header, data=json.dumps(data))
    result = response.json()
    dic_profesor_info = {
        'identificacion': result['result']['data']['docente'],
        'puesto': 'Docente',
    }
    if response.status_code == 200:
        return dic_profesor_info
    else:
        return False


def get_student(id):
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/get_estudiante_info/'
    data = {
        'identificacion': id
    }
    new_header = {
        'Content-Type': 'application/json'
    }

    response = requests.get(url, headers=new_header, data=json.dumps(data))
    result = response.json()

    if result['result']['data']['estudiante']['estado_migratorio'] == 'Nacional':
        tipo_identificacion = '1'
    elif result['result']['data']['estudiante']['estado_migratorio'] == 'Extranjero':
        tipo_identificacion = '3'
    else:
        tipo_identificacion = '3'

    estudiante = result['result']['data']['estudiante']
    nombre = estudiante.get('nombre')
    primer_apellido = estudiante.get('primer_apellido')
    segundo_apellido = estudiante.get('segundo_apellido')
    nombre_completo = estudiante.get('nombre_completo', '')
    if not nombre or not primer_apellido or not segundo_apellido:
        partes = nombre_completo.strip().split()
        if len(partes) >= 3:
            primer_apellido = partes[0]
            segundo_apellido = partes[1]
            nombre = ' '.join(partes[2:])
        else:
            # Fallback en caso de que el nombre completo no tenga al menos 3 partes
            primer_apellido = primer_apellido or ''
            segundo_apellido = segundo_apellido or ''
            nombre = nombre or nombre_completo
    dic_estudiante_info = {
        'identificacion': result['result']['data']['estudiante']['identificacion'],
        'tipo_identificacion': tipo_identificacion,
        'estado_migratorio': result['result']['data']['estudiante']['estado_migratorio'],
        'nombre_completo': result['result']['data']['estudiante']['nombre_completo'],
        'nombre': nombre,
        'primer_apellido': primer_apellido,
        'segundo_apellido': segundo_apellido,
        'fecha_nacimiento': result['result']['data']['estudiante']['fecha_nacimiento'],
        'numero_telefonico': result['result']['data']['estudiante']['numero_telefonico'],
        'numero_telefonico2': result['result']['data']['estudiante']['numero_telefonico2'],
        'correo_institucional': result['result']['data']['estudiante']['correo_institucional'],
        'correo_personal': result['result']['data']['estudiante']['correo_personal'],
        'nacionalidad': result['result']['data']['estudiante']['pais_Origen'],
        'provincia': result['result']['data']['estudiante']['provincia'],
        'canton': result['result']['data']['estudiante']['canton'],
        'distrito': result['result']['data']['estudiante']['distrito'],
        'direccion_exacta': result['result']['data']['estudiante']['direccion_exacta'],
        'colegio_procedencia': result['result']['data']['estudiante']['colegio_procedencia'],
        'universidad_procedencia': result['result']['data']['estudiante']['universidad_procedencia'],
        'fecha_graduacion': result['result']['data']['estudiante']['fecha_graduacion'],
        'ingresoEconomico': result['result']['data']['estudiante']['ingresoEconomico'],
    }

    if response.status_code == 200:
        return dic_estudiante_info
    else:
        return False


def get_student_study(id):
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/get_estudiante_info_carrera/'
    data = {
        'identificacion': id
    }
    new_header = {
        'Content-Type': 'application/json'
    }

    response = requests.get(url, headers=new_header, data=json.dumps(data))
    if response.status_code == 200:
        result = response.json()
        user_studies.objects.create(identificacion=id, estudio=result['result']['data']['estudiante']['carrera'],
                                    cursando=True)
        return True
    else:
        return False


def get_professor(id):
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/get_docente_info/'
    data = {
        'identificacion': id
    }
    new_header = {
        'Content-Type': 'application/json'
    }

    response = requests.get(url, headers=new_header, data=json.dumps(data))
    result = response.json()

    dic_profesor_info = {
        'identificacion': result['result']['data']['docente']['identificacion'],
        'nombre': result['result']['data']['docente']['nombre'],
        'primer_apellido': result['result']['data']['docente']['primer_apellido'],
        'segundo_apellido': result['result']['data']['docente']['segundo_apellido'],
        'numero_telefonico': result['result']['data']['docente']['numero_telefonico'],
        'correo_institucional': result['result']['data']['docente']['correo_institucional'],
        'correo_personal': result['result']['data']['docente']['correo_personal'],
        'nacionalidad': result['result']['data']['docente']['pais_Origen'],
        'sexo': result['result']['data']['docente']['sexo']
    }

    if response.status_code == 200:

        return dic_profesor_info
    else:

        return False


def get_status_student(request, id):
    url_api_erp = settings.URL_API_ERP
    url_planes = 'http://' + url_api_erp + '/get_planes_estudio/'
    data_planes = {
        'identificacion': id
    }
    header = {
        'Content-Type': 'application/json'
    }

    response_planes = requests.get(url_planes, headers=header, data=json.dumps(data_planes))
    result_planes = response_planes.json()

    principal = result_planes['result']['data']['principal']
    try:
        secundarios = result_planes['result']['data']['secundarios']
        exist_secundarios = True
    except ValueError:
        exist_secundarios = False

    url_curricula = 'http://' + url_api_erp + '/get_planes_estudio_curricula/'
    data_curricula = {
        'plan': principal[0],
        'identificacion': id
    }

    response_curricula = requests.get(url_curricula, headers=header, data=json.dumps(data_curricula))
    result_curricula = response_curricula.json()

    cursos_cursando = result_curricula['result']['data']['cursosCursandoCodigos']

    if cursos_cursando:
        save_profile_processes.update_user_status(request, id, 'cursando', True)
    else:
        if exist_secundarios:
            for curso_secundario in secundarios:
                data_curricula = {
                    'plan': curso_secundario,
                    'identificacion': id
                }

                response_curricula = requests.get(url_curricula, headers=header, data=json.dumps(data_curricula))
                result_curricula = response_curricula.json()

                cursos_cursando = result_curricula['result']['data']['cursosCursandoCodigos']

                if cursos_cursando:
                    save_profile_processes.update_user_status(request, id, 'cursando', True)
                    break


def get_sedes(request):
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/get_sede/'
    data = json.dumps({})
    new_header = {
        'Content-Type': 'application/json'
    }

    response = requests.get(url, headers=new_header, data=data)
    result = response.json()

    if response.status_code == 200:

        return result['result']['data']['sedes']
    else:

        return False


def get_finance(request):
    user = request.user
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/get_pagare_estudiante'
    payload = json.dumps({
        "identificacion": user.username,
    })
    headers = {
        'Content-Type': 'application/json',
    }
    response = requests.request("GET", url, headers=headers, data=payload)
    data = json.loads(response.text)

    if data['result']['data']['pagares']['financiamiento_Disponible'] == 0 and data['result']['data']['pagares'][
        'saldo_Favor'] == 0 and not data['result']['data']['pagares']['pagares']:
        return False
    else:
        return True


def get_enrrollment(request):
    user = request.user
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/get_pre_matricula'
    payload = json.dumps({
        "identificacion": user.username,
    })
    headers = {
        'Content-Type': 'application/json',
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    data = json.loads(response.text)

    if not data['result']['data']['valsCostos'] and not data['result']['data']['periodos']:
        return False
    else:
        save_profile_processes.update_user_status(request, user.username, 'matricula', True)
        return True
    # SIN USO


def get_preenrrollment(request):
    user = request.user
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/get_pre_matricula'
    payload = json.dumps({
        "identificacion": user.username,
    })
    headers = {
        'Content-Type': 'application/json',
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    data = json.loads(response.text)

    if not data['result']['data']['valsCostos'] and not data['result']['data']['periodos']:
        return False
    else:
        save_profile_processes.update_user_status(request, user.username, 'matricula', True)
        return True

    # CAMBIAR


def get_carreras(request, sede, tipo):
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/get_carrera_sede/'
    data = json.dumps({'sede': sede, 'tipo': tipo})
    new_header = {
        'Content-Type': 'application/json'
    }

    response = requests.post(url, headers=new_header, data=data)
    result = response.json()

    if response.status_code == 200:

        return result['result']['data']['carreras']
    else:

        return False


def get_instituciones(request, tipo):
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/get_instituciones/'
    data = json.dumps({'tipoInstitucion': tipo})
    new_header = {
        'Content-Type': 'application/json'
    }

    response = requests.post(url, headers=new_header, data=data)
    result = response.json()
    if response.status_code == 200:

        return result['result']['data']
    else:

        return False


def get_asesores(request):
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/get_miembro_equipo/'
    data = json.dumps({})
    new_header = {
        'Content-Type': 'application/json'
    }

    response = requests.get(url, headers=new_header, data=data)
    result = response.json()

    if response.status_code == 200:

        return result['result']['data']['equipo']
    else:

        return False

    # VERIFICAR


def set_estudiante_info(request, data):
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/set_estudiante_info/'
    data = json.dumps(data)
    new_header = {
        'Content-Type': 'application/json'
    }
    response = requests.post(url, headers=new_header, data=data)
    result = response.json()

    if response.status_code == 200:
        return True
    else:
        return False

def set_docente_info(request, data):
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/set_docente_info/'
    data = json.dumps(data)
    new_header = {
        'Content-Type': 'application/json'
    }
    response = requests.post(url, headers=new_header, data=data)
    result = response.json()

    if response.status_code == 200:
        return True
    else:
        return False


def enviar_data_odoo(request, data):
    user = request.user
    nuevo_prospecto = request.session.get('user_info')

    # Claves a eliminar si están presentes
    claves_condicionales = [
        'estado',
        'actualizo',
        'nombre_completo',
        'colegio_procedencia',
        'universidad_procedencia',
        'fecha_graduacion',
        'ingresoEconomico'
    ]
    tipo_pros = nuevo_prospecto.get("tipo")  # Se guarda si se necesita
    nuevo_prospecto.pop('tipo', None)  # Se elimina incondicionalmente

    for clave in claves_condicionales:
        if nuevo_prospecto.get(clave):
            nuevo_prospecto.pop(clave)
        if not nuevo_prospecto.get(clave):
            nuevo_prospecto.pop(clave, None)
    prospecto_user = prospecto(**nuevo_prospecto)
    nuevo_prospecto["tipo"] = tipo_pros

    url_api_erp = settings.URL_API_ERP
    if tipo_pros == 'estudiante' or tipo_pros == '':
        url = 'http://' + url_api_erp + '/carrera_estudiante'
    else:
        url = 'http://' + url_api_erp + '/create_estudiante'

    keys_to_check = [
        'periodo_id',
        'docFotoPasaporte',
        'docTitulo',
        'docIdentificacion',
        'docMateriasAprobadas',
        'docPlanEstudios',
        'docTituloUniversitario',
        'colegio_id',
        'universidad_id',
        'carrera_id',
        'sede_id',
        'empleadoAsignadoInicial',
        'ingresoEconomico',
        'fechaGraduacion'
    ]

    for key in keys_to_check:
        if key not in data:
            data[key] = None

    if prospecto_user.sexo != "Masculino" and prospecto_user.sexo != "Femenino":
        prospecto_sexo = 'Otro'
    else:
        prospecto_sexo = prospecto_user.sexo

    data_odoo = {
        "identificacion": prospecto_user.identificacion,
        "psNombre": (prospecto_user.nombre).upper(),
        "primerApellido": (prospecto_user.primer_apellido).upper(),
        "segundoApellido": (prospecto_user.segundo_apellido).upper(),
        "fechaNacimiento": prospecto_user.fecha_nacimiento,
        "sexo": prospecto_sexo,
        "pais_id": prospecto_user.nacionalidad,
        "colegio_id": data['colegioProcedencia'],
        "universidad_id": data['universidadProcedencia'],
        "carrera_id": (data['carrera_id']).upper(),
        "sede_id": data['sede_id'],
        "ingresoEconomico": data['ingresoEconomico'],
        "provincia_id": (prospecto_user.provincia).upper(),
        "canton_id": (prospecto_user.canton).upper(),
        "distrito_id": (prospecto_user.distrito).upper(),
        "direccionExacta": (prospecto_user.direccion_exacta).upper(),
        # "docTitulo": data['docTitulo'],
        # "docTituloUniversitario": data['docTituloUniversitario'],
        # "docIdentificacion": data['docIdentificacion'],
        # "docFotoPasaporte": data['docFotoPasaporte'],
        # "docMateriasAprobadas": data['docMateriasAprobadas'],
        # "docPlanEstudios": data['docPlanEstudios'],
        "numeroTelefono_Principal": prospecto_user.numero_telefonico,
        "numeroTelefono_secundario": prospecto_user.numero_telefonico2,
        "correoPersonal": prospecto_user.correo_personal,
        "estado_Migratorio": prospecto_user.estado_migratorio,
        "tipo_identificacion": prospecto_user.tipo_identificacion,
        "fecha_graduacion": data['fechaGraduacion'],
        "lugar_Trabajo": data['trabajo'],
        "cliente_tipo": "Utilizar información del estudiante"
    }

    new_header = {
        'Content-Type': 'application/json'
    }

    response = requests.post(url, headers=new_header, data=json.dumps(data_odoo))
    result = response.json()

    if response.status_code == 200:

        return True
    else:

        return False


def set_payment_matricula(request, ordenid):
    user = request.user
    url_api_erp = settings.URL_API_ERP
    session_key = f'pago_procesado_{ordenid}'
    if request.session.get(session_key):
        return True
    if '-abonoLetra' in ordenid:
        url = f'http://{url_api_erp}/set_pagare_estudiante_abono/'
        data = {
            'identificacion': user.username,
            'consecutivo': request.session.get('consecutivo'),
            'monto': float(request.session.get('preMatricula')),
            'total_saldo_Favor': float(request.session.get('saldoFavorAbono')),
        }
    else:
        url = f'http://{url_api_erp}/set_pago_matricula/'
        data = {
            'orden_venta_id': ordenid
        }
    new_header = {
        'Content-Type': 'application/json'
    }

    response = requests.post(url, headers=new_header, data=json.dumps(data))

    if response.status_code == 200:
        request.session[session_key] = True
        request.session.modified = True
        return True
    else:

        return False


def get_urls_odoo(request, data):
    user = request.user
    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/get_prospecto_docs'
    data = {
        'identificacion': user.username
    }
    new_header = {
        'Content-Type': 'application/json'
    }

    response = requests.post(url, headers=new_header, data=json.dumps(data))
    result = response.json()

    if response.status_code == 200:

        return True
    else:

        return False


def update_request(request, data):
    user = request.user
    # url = 'http://192.168.8.134:8000/update-request/'

    # new_header = {
    #     'Content-Type':'application/json'
    # }

    # response = requests.post(url, headers=new_header, data=json.dumps(data))
    # result = response.json()

    # if response.status_code == 200:
    #
    #     return True
    # else:
    #
    #     return False
    return True

    url_api_erp = settings.URL_API_ERP
    url = 'http://' + url_api_erp + '/set_pago_matricula/'
    data = {
        'orden_venta_id': ordenid
    }
    new_header = {
        'Content-Type': 'application/json'
    }

    response = requests.post(url, headers=new_header, data=json.dumps(data))

    if response.status_code == 200:

        return True
    else:

        return False


def user_morosidad_documento(request):
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
    result = json_response.get('result', {})
    if result.get('status') == 'error':
        return False
    # Obtener datos de forma segura
    data = result.get('details', {}) or {}

    # Valores por defecto (cuando no viene nada)
    id_user = data.get('id')
    status = data.get('status', 'normal')
    moroso_documentos = data.get('moroso_documentos', False)
    morosidad_fina = data.get('morosidad_fina', False)

    # Si no viene nada → valor = False
    valor = bool(moroso_documentos or morosidad_fina)

    return valor