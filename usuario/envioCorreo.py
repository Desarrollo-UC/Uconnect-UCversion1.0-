import base64
from email.message import EmailMessage
import random
from django.core.mail import send_mail, get_connection, EmailMessage, EmailMultiAlternatives
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.decorators import login_required
import json
from django.template.loader import render_to_string
import requests
from datetime import datetime
from datetime import date

class Correo():
    @staticmethod
    def envioCorreos(**kwargs):
        email_credentials = settings.EMAIL_HOST_USERS[kwargs['correoSend']]
        user=email_credentials['user'] 
        passW=email_credentials['pass']
        with get_connection(  
            host=settings.EMAIL_HOST, 
            port=settings.EMAIL_PORT,  
            username=user, 
            password=passW, 
            use_tls=settings.EMAIL_USE_TLS  
        ) as connection: 
            emailTo = kwargs['emailTo']
            emailCC = kwargs['emailCC']
            asunto = kwargs['asunto']
            mensaje = kwargs['mensaje']
            archivo_adjunto = kwargs['archivo']
            
            if isinstance(emailTo, list) and len(emailTo) > 1:
                recipient_list = emailTo
            else:
                recipient_list = emailTo.split(',') if isinstance(emailTo, str) else [emailTo[0]]

            recipient_list = [email.strip() for email in recipient_list]
            cc_list = emailCC.split(',') if emailCC else []
            cc_list = [email.strip() for email in cc_list]
            try:
                email = EmailMultiAlternatives(asunto, mensaje, user, recipient_list, cc=cc_list, connection=connection)
                email.attach_alternative(mensaje, 'text/html')
                if archivo_adjunto:
                    email.attach(archivo_adjunto.name, archivo_adjunto.read(), archivo_adjunto.content_type)
                email.send()
                return JsonResponse({'status': 'success', 'message': 'Correo enviado correctamente.'})
            except Exception as e:
                print(str(e)) 
                return JsonResponse({'status': 'error', 'message': 'Error al enviar el correo.'})
            
    def codigoVerificacion(request):
        codigo = random.randint(1000, 9999)
        correo_destinatario = request.GET.get("correo")
        username = request.GET.get("nombre")
        print(correo_destinatario)
        subject = 'Código de verificación'
        mensaje1 = 'Este es el código para finalizar el proceso de registro.\n\n'
        mensaje2 = 'El código es:'
        codigo = codigo
        mensaje3 = '\n\nEL CODIGO SOLO ES VALIDO PARA EL DIA DE HOY.\n\n'
        mensaje4 = 'Un cordial saludo.'
        
        mensaje = render_to_string('Correo/correo.html', {
        'username': username,
        'mensaje1': mensaje1,
        'mensaje2': mensaje2,
        'codigo': codigo,
        'mensaje3': mensaje3,
        'mensaje4': mensaje4,
        })
        Correo.envioCorreos(correoSend=0, emailTo=correo_destinatario,emailCC=None,asunto=subject,mensaje=mensaje,archivo=None)
        return JsonResponse(codigo, safe=False)
    
    def envioDeConsultas(request,**kwargs):
        user = request.user
        json_data = json.loads(request.body)
        print(json_data)
        subject = json_data.get('categorias', '') 
        nombre = json_data.get('nombre', '')
        mensaje = json_data.get('mensaje', '') 
        correo = user.email
        correoSend = json_data.get('correoSend', '') 
        
        mensaje1 = 'El estudiante con el correo: '+ correo +'\n\n'
        mensaje2 = 'Ha enviado el siguiente mensaje: '
        mensaje3 = '\n'+ mensaje.upper() +'\n\n'
        mensaje4 = 'Espera su pronta respuesta, gracias.'
        
        mensaje = render_to_string('Correo/correo_contacto.html', {
            'username': user.username,
            'mensaje1': mensaje1,
            'mensaje2': mensaje2,
            'mensaje3': mensaje3,
            'mensaje4': mensaje4,
        })
        context = {}
        try:
            Correo.envioCorreos(correoSend=1, emailTo=correoSend,emailCC=None,asunto=subject,mensaje=mensaje,archivo=None)
            context['response'] = True
        except Exception as e:
            context['response'] = False
            context['error_message'] = str(e)
        return JsonResponse(context, safe=False)
    
    def envioCorreoP(request):
        if request.method == 'POST':
            emailTo = request.POST.get('email')
            emailCC = request.POST.get('emailCC')
            asunto = request.POST.get('asunto')
            mensaje = request.POST.get('mensaje')
            archivo_adjunto = request.FILES.get('file')
            access_token = request.session.get('access_token')
            
            url = 'https://graph.microsoft.com/v1.0/me/sendMail'
            
            data_mail = {
                "message": {
                    "subject": asunto,
                    "body": {
                    "contentType": "Text",
                    "content": mensaje
                    },
                    "toRecipients": 
                    [{
                        "emailAddress": {
                            "address": emailTo
                        }
                    }]
                }
            }
            
            if emailCC is not None:
                data_mail["message"]["ccRecipients"] = [{
                    "emailAddress": {
                        "address": emailCC
                    }
                }]
                
            if archivo_adjunto is not None:
                contenido_archivo = archivo_adjunto.read()
                base64_data = base64.b64encode(contenido_archivo).decode('utf-8')
                data_mail["message"]["attachments"] = [{
                    "@odata.type": "#microsoft.graph.fileAttachment",
                    "name": archivo_adjunto.name,
                    "contentBytes": base64_data
                }]
            
            payload = json.dumps(data_mail)
            
            headers = {
                'Authorization': 'Bearer ' + access_token,
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, headers=headers, data=payload)
            
            return JsonResponse({'status': 'success', 'message': 'Correo enviado correctamente.'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Solicitud inválida.'})
        
    def sendCorreo(request):
        json_data = json.loads(request.body)
        subject = 'Reenvió de credenciales' 
        mensajeSend = json_data.get('mensaje', '') 
        correo = json_data.get('email', '') 
        context = {}
        try:
            mensaje = render_to_string('Correo/correo.html', {
            'username': json_data.get('nombre', ''),
            'mensaje': mensajeSend,
            })
            Correo.envioCorreos(correoSend=0, emailTo=correo,emailCC=None,asunto=subject,mensaje=mensaje,archivo=None)
        except Exception as e:
            context['response'] = False
            context['error_message'] = str(e)
        return JsonResponse(context, safe=False)  
    
    def confirmacionCambioMicrosoft(request):
        user = request.session.get('user_info')
        
        fecha_actual = date.today().strftime('%Y-%m-%d')
        hora_actual = datetime.now()
        hora_actual_str = hora_actual.strftime('%H:%M:%S')
        
        correo_CC = user["correo_institucional"]
        correo_destinatario = user["correo_personal"]
        print(correo_destinatario)
        subject = 'Cambio de contraseña cuenta institucional.'
        mensaje1 = 'La contraseña de la cuenta de correo institucional se cambió el día '+ fecha_actual +' '+ hora_actual_str +'\n\n'
        mensaje2 = 'Si has sido tú, puedes descartar tranquilamente este correo electrónico.\n\n'
        mensaje3 = 'En caso contrario, por favor ponte en contacto con soporte_tecnico@uia.ac.cr para brindarte apoyo.\n\n'
        mensaje4 = 'Un cordial saludo.'
        
        mensaje = render_to_string('Correo/correo_cambio.html', {
        'username': user["identificacion"],
        'mensaje1': mensaje1,
        'mensaje2': mensaje2,
        'mensaje3': mensaje3,
        'mensaje4': mensaje4,
        })
        context = {}
        Correo.envioCorreos(correoSend=0, emailTo=correo_destinatario,emailCC=correo_CC,asunto=subject,mensaje=mensaje,archivo=None)
        context['response'] = True
        return JsonResponse(context, safe=False)