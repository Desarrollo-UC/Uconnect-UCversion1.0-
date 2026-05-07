from django.shortcuts import get_object_or_404
from django.templatetags.static import static
from usuario.api_queries import get_enrrollment, get_finance, user_morosidad_documento
from usuario.models import user_status, user_studies

def custom_context(request):
    # Define las variables de contexto que deseas utilizar
    logo_url = static('img/logoUCR.png')
    copyRigth= '2023 Universidad Central. Todos Los Derechos Reservados.'
    footerCorreo = 'info@uc.ac.cr'
    footerContacto1 = '4108-9400'
    formPrimerIngreso = static('img/primer_ingreso-min.jpg')
    formPosgrados = static('img/posgrados.jpg')
    formCursoLibre = static('img/cursos_libres-min.jpg')
    
    # Retorna un diccionario de variables de contexto
    return {
        'logo_url': logo_url,
        'copyRigth': copyRigth,
        'footerCorreo': footerCorreo,
        'footerContacto1': footerContacto1,
        'formPrimerIngreso': formPrimerIngreso,
        'formPosgrados': formPosgrados,
        'formCursoLibre': formCursoLibre,
    }

def set_menu_verification(request):
    menu = {}
    if 'user_info' in request.session:
        user = request.session.get('user_info')
        try:
            status = user_status.objects.get(identificacion=user['identificacion'])
            morosoDoc = user_morosidad_documento(request)
            if not status.moroso:
                try:
                    user_s = user_studies.objects.filter(identificacion=user['identificacion']).first()
                    inicio = False
                    prematricula_envio = False
                    prematricula = False
                    matricula = False
                    cursando = False
                    tramites = False
                    finance = False
                    if user['tipo'] == 'prospecto':
                        tramites = False
                        inicio = True
                    elif user['tipo'] == 'estudiante':
                        inicio = True
                        tramites = True
                    elif user['tipo'] == 'estudiante/profesor':
                        inicio = True
                        tramites = True
                    if user_s.prematricula_envio or user_s.formulario:
                        prematricula_envio = True
                    if user_s.prematricula:
                        prematricula = True
                    if user_s.matricula:
                        matricula = get_enrrollment(request)
                        #matricula = True
                    if user_s.cursando:
                        cursando = True
                            
                    finance = get_finance(request)
                    #finance = True
                        
                    menu = {
                        'perfil': True,
                        'inicio': inicio,
                        'informacion': True,
                        'ver_proceso': prematricula_envio,
                        'servicios': prematricula,
                        'cursos': cursando,
                        'matricula': matricula,
                        'tramites': tramites,
                        'financiero': finance,
                        'moroso': False,
                        'morosoDoc': morosoDoc
                    }
                except:
                    inicio = False
                    if user['tipo'] == 'prospecto':
                        tramites = False
                        prematricula_envio = False
                        prematricula = False
                        matricula = False
                        cursando = False
                        finance = False
                        inicio = True
                    elif user['tipo'] == 'estudiante':
                        tramites = True
                        prematricula_envio = False
                        prematricula = True
                        matricula = get_enrrollment(request)
                        inicio = True
                        cursando = True
                        finance = get_finance(request)
                        
                    elif user['tipo'] == 'estudiante/profesor':
                        tramites = True
                        prematricula_envio = False
                        prematricula = True
                        matricula = get_enrrollment(request)
                        #matricula = True
                        cursando = True
                        #finance = get_finance(request)
                        finance = False
                        inicio = True
                    
                    menu = {
                        'perfil': True,
                        'inicio': inicio,
                        'informacion': True,
                        'ver_proceso': prematricula_envio,
                        'servicios': prematricula,
                        'cursos': cursando,
                        'matricula': matricula,
                        'tramites': tramites,
                        'financiero': finance,
                        'moroso': False,
                        'morosoDoc': morosoDoc
                    }
            else:
                menu = {
                    'perfil': False,
                    'inicio': True,
                    'informacion': False,
                    'ver_proceso': False,
                    'servicios': False,
                    'cursos': False,
                    'matricula': True,
                    'tramites': False,
                    'financiero': True,
                    'moroso': True,
                    'morosoDoc': morosoDoc
                }
        except user_status.DoesNotExist:
            menu = {
                'perfil': True,
                'inicio': True,
                'informacion': True,
                'ver_proceso': False,
                'servicios': False,
                'cursos': False,
                'matricula': False,
                'tramites': False,
                'financiero': False,
                'moroso': False,
                'morosoDoc': False
            }
        request.session['menu'] = menu
        request.session.save()
    
    return {'menu': menu}
    
    
