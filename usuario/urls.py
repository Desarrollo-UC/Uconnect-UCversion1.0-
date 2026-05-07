from django.urls import path, re_path
from django.template.loader import render_to_string
from .payment import (
    obtener_keyiD,
    obtener_hash_entrada,
    PaymentApproved,
)
from .api_queries import (
    obtener_datos,
    obtener_provincia,
    obtener_canton,
    obtener_distrito,
    obtener_nacionalidad,
    obtener_fecha_unix,
)
from .api_processes import (
    documents_status,
    user_update,
    solicitud_form,
    user_status,
    login_api_sa,
    logout_api_sa,
    user_status_form,
)
from .save_processes import (
    payment_update_user_prospecto,
    payment_update_user_prospecto_with_post
)
from .views import *
from .administrativo import (
    DashboardAdministrativoView,
    ImagenNoticias,
    Noticias,
    Soporte,
    cambiar_rol_ajax,
    buscar_usuario,
    buscar_usuario_sugerencias,
)
from .envioCorreo import (
    Correo
)
from django.contrib.auth.views import LogoutView
from django.contrib.auth import views as auth_views

urlpatterns = [path('', Logueo.as_view(), name='login'),
               path('registro_estudiantes/', PaginaRegistroEstudiante.as_view(),
                    name='registro_estudiantes'),
               path('logout/', CustomLogoutView.as_view(), name='logout'),
               path('carga-usuarios/', carga_usuarios, name='carga_usuarios'),
               path('login-sa/', login_api_sa, name='login_api_sa'),
               path('logout-sa/', logout_api_sa, name='logout_api_sa'),
               path('user-status-form/', user_status_form, name='user_status_form'),
               path('microsoft-auth/', microsoft_auth, name='microsoft_auth'),
               path('microsoft-callback/', microsoft_callback,
                    name='microsoft_callback'),

               path('logout/', MicrosoftLogoutView.as_view(), name='logout'),

               path( 'change-password/', auth_views.PasswordChangeView.as_view( template_name='Contrasenas/Correo/change-password.html',
        success_url='/logout/'
    ),
    name='change_password'
),
    path('restPass/', custom_password_reset, name='cambioContrasenna'),
    path('password-reset/',
         auth_views.PasswordResetView.as_view(
             template_name='Contrasenas/Correo/password_reset.html',),
         name='password_reset'),

    path('password-reset/done/',
         auth_views.PasswordResetDoneView.as_view(
             template_name='Contrasenas/Correo/password_reset_done.html'
         ),
         name='password_reset_done'),

    path('password-reset-confirm/<uidb64>/<token>/',
         auth_views.PasswordResetConfirmView.as_view(
             template_name='Contrasenas/Correo/password_reset_confirm.html'
         ),
         name='password_reset_confirm'),

    path('password-reset-complete/',
         auth_views.PasswordResetCompleteView.as_view(
             template_name='Contrasenas/Correo/password_reset_complete.html'
         ),
         name='password_reset_complete'),

    path('universidadesselect/', universidadesselect, name='universidadesselect'),
    path('sedesselect/', sedesselect, name='sedesselect'),
    path('carrerasselect/', carrerasselect, name='carrerasselect'),
    path('colegiosselect/', colegiosselect, name='colegiosselect'),
    path('asesoreselect/', asesoreselect, name='asesoreselect'),
    

    re_path(r'^inicio/(?P<type>prospecto|estudiante|profesor|profesor-estudiante)/$',DashboardView.as_view(), name='inicio'),
    re_path(r'^estudiar/(?P<type>prospecto|estudiante|profesor|profesor-estudiante)/$', EstudiarUIA.as_view(), name='estudiaUia'),
 
    path('obtener-datos/', obtener_datos, name='obtener_datos'),
    path('obtener-provincia/', obtener_provincia,
         name='obtener_provincia'),
    path('obtener-canton/', obtener_canton, name='obtener_canton'),
    path('obtener-distrito/', obtener_distrito,
         name='obtener_distrito'),
    path('obtener-nacionalidad/', obtener_nacionalidad,
         name='obtener_nacionalidad'),

    path('enviar-solicitud/',
         EnvioSolicitud.enviar_solicitud, name='enviar_solicitud'),
    
    path('enviar-solicitud-temp/',
         EnvioSolicitudTemp.enviar_solicitud, name='enviar_solicitud_temp'),

    path('enviar-archivo-a-dspace/', enviar_archivo_a_dspace,
         name='enviar_archivo_a_dspace'),
    path('mostrar-foto/', mostrar_foto, name='mostrar_foto'),
    path('cambiar-foto/', cambiar_foto, name='cambiar_foto'),

    path('<str:type>/perfil/', vistaPerfil.profile_view, name='perfil'),
    path('<str:type>/abono/', EstadoDeCuentaEstudiante.verAbono, name='abono'),
    path('get_consecutivo/', EstadoDeCuentaEstudiante.get_consecutivo, name='get_consecutivo'),
    path('get_monto_total/', EstadoDeCuentaEstudiante.get_monto_total, name='get_monto_total'),
    path('<str:type>/perfil-temp/', vistaPerfilTemp.profile_view, name='perfil_temp'),

    path("<str:type>/revision-form/",
         RevisionFormView.as_view(), name="revision_form"),

    path("corregir-data/", corregirdata, name="corregir_data"),
    path("documents-status/", documents_status,
         name="documents_status"),
    path("user-update/", user_update, name="user_update"),
    path("solicitud-form/", solicitud_form, name="solicitud_form"),
    path("user-status/", user_status, name="user_status"),

    path("<str:type>/horario/", HorarioEstudianteView.periodoHorario_view,
         name='horarioEstudiante'),
    path("getHorarios/", HorarioEstudianteView.getListHorarios,
         name='getHorarios'),
    path("<str:type>/plan/", PlanDeEstudioView.as_view(),
         name='planEstudio'),
    path("<str:type>/plan/carrera/",
         DetallePlanDeEstudioView.getPlan, name='planEstudioCarrera'),
    path("<str:type>/misCursos/",
         MisCursos.periodoCurso_view, name='misCursos'),
    path("misCursosDetalle/",
         MisCursos.getCurso, name='misCursosDetalle'),
    path("<str:type>/matricula/",
         MatriculaView.as_view(), name='matricula'),
    path("<str:type>/suficiencia/",
         SuficienciaView.as_view(), name='suficiencia'),
    path("verPrematricula/",
         DetallePlanDeEstudioView.verPrematricula, name='verPrematricula'),
    path("verCambio/",
         DetallePlanDeEstudioView.verCambio, name='verCambio'),
    path("cambioCurso/",
         DetallePlanDeEstudioView.cambioCurso, name='cambioCurso'),
    path("<str:type>/estadoCuenta/", EstadoDeCuentaEstudiante.estadoCuentaEstudiante,
         name='estadoCuentaEstudiante'),
    path("detallelineacredito/", EstadoDeCuentaEstudiante.getDetalleCarreraLinea,
         name='detallelineacredito'),
    path('codigoVerificacion/', Correo.codigoVerificacion,
         name='codigoVerificacion'),

     path("<str:type>/resumenPago/",
         ResumenPagoGeneralView.as_view(), name='resumen_pago'),
    path("<str:type>/pagarMatricula/",
         Payment.as_view(), name='payment'),
    path("obtener-time/", obtener_fecha_unix, name='obtener_time'),
    path("obtener-key/", obtener_keyiD, name='obtener_key'),
    path("hash-entrada/", obtener_hash_entrada, name='hash_entrada'),
    path("<str:type>/pago-realizado/",
         PaymentApproved.as_view(), name='pago_realizado'),

    path("Estudiante/plan/cursoPlanHorario/",
         HorarioPlanDeEstudioView.getHorario, name='horarioCursoPlan'),
    path("<str:type>/ubicacion/",
         Ubicacion.ubicacion_view, name='ubicacion'),
    path("<str:type>/contactenos/",
         Contactenos.contactenos_view, name='contactenos'),
    path("plan/envioPrematricula/",
         EnvioPrematricula.envioPrematricula, name='envioPrematricula'),

    path("pago-finalizado/",
         payment_update_user_prospecto, name='pago_finalizado'),
    path('update_user_prospecto_with_post/', payment_update_user_prospecto_with_post, name='update_user_prospecto_with_post'),
    path("<str:type>/politicas/",
         Politicas.politicas_view, name='politicas'),
    path("<str:type>/terminos/",
         Terminos.terminos_view, name='terminos'),
    path("<str:type>/envioConsulta/",
         Correo.envioDeConsultas, name='envioConsulta'),
    re_path(r'^(?P<type>administrador)/(?P<id>[\w@.+-]+)/$', DashboardAdministrativoView.as_view(), name='inicioAdministrativo'),
    path('guardarImagen/', ImagenNoticias.guardarImagenNoticia,
         name='guadarImagenes'),
    path('eliminarImageNoticia/', ImagenNoticias.borrarFotosNoticias,
         name='eliminarImageNoticia'),
    path('buscarImageNoticia/', ImagenNoticias.mostrarFotosNoticiasId,
         name='buscarImageNoticia'),
    path('actualizarImageNoticia/', ImagenNoticias.actualizarFotosNoticias,
         name='actualizarImageNoticia'),

    path('guardarNoticia/', Noticias.guardarNoticia,
         name='guardarNoticia'),
    path('eliminarNoticia/', Noticias.borrarNoticias,
         name='eliminarNoticia'),
    path('buscarNoticia/', Noticias.mostrarNoticiasId,
         name='buscarNoticia'),
    path('actualizarNoticia/', Noticias.actualizarNoticias,
         name='actualizarNoticia'),

    path('mostrarAjaxI/<str:id>/',
         ImagenNoticias.mostrarFotosNoticiasU, name='mostrarAjaxI'),
    path('mostrarAjaxN/<str:id>/',
         Noticias.mostrarNoticiasU, name='mostrarAjaxN'),

    path('inspeccionar/<str:type>/<str:user>/',
        Soporte.getPlan, name='inspeccionar'),
    path('inspeccionarprofe/<str:type>/<str:user>/',
        Soporte.misCursosP, name='inspeccionarprofe'),
    path('api/buscar-usuario/', buscar_usuario, name='buscar_usuario'),
    path('api/buscar-usuario-sugerencias/', buscar_usuario_sugerencias, name='buscar_usuario_sugerencias'),
    path('usuarios/cambiar-grupo-ajax/',cambiar_rol_ajax,name='cambiar_grupo_ajax'),
    path('inspeccionar/misCursos/<str:type>/<str:user>/',
        Soporte.misCursos, name='misCursosS'),
    path('inspeccionar/horario/<str:type>/<str:user>/',
        Soporte.horarios, name='horarioS'),
    path('inspeccionar/estadoCuenta/<str:type>/<str:user>/',
        Soporte.estadoCuenta, name='estadoCuentaS'),
    path('inspeccionar/perfil/<str:type>/<str:user>/',
        Soporte.perfil, name='perfilS'),
    path('inspeccionarProspecto/<str:type>/<str:user>/',
        Soporte.perfil, name='inspeccionarPr'),
    path('inspeccionarProspecto/<str:type>/<str:user>/correo',
        Soporte.correo, name='inspcorreo'),

    path('correoSendS/', Correo.sendCorreo, name='correoSend'),
    path('actODesc/', Soporte.actODesac, name='actODesc'),
    path('<str:type>/misCursosP/',
         MiscursosP.misCursos_view, name='misCursosP'),
    path("getCurso/", MiscursosP.detalleCursoPeriodo,
         name='detalleCursosP'),
    path("getListaEstudiantes/", MiscursosP.listEstudiante,
         name='listaEstudiante'),
    path("enviarERP/", MiscursosP.enviarERP, name='enviarERP'),
    path('<str:type>/historial-curso/',
         MiscursosP.historial_curso_view, name='historialCurso'),
    path("getCursoH/", MiscursosP.detalleHistorialCursoPeriodo,
         name='detalleCursosPHgetCurso'),
    path("asistencia/pdf/<str:periodo>/<str:acta>/<str:codigo_curso>/", MiscursosP.descargar_asistencia_pdf,
         name='asistencia_pdf'),
    path('cambiarColor/', cambiar_color, name='cambiarColor'),
    path("<str:type>/envioCorreo/", CorreoP.correoP, name='correo'),
    path("envioCorreoP/", Correo.envioCorreoP, name='correoP'),
    path("<str:type>/certificaciones/",
         Certificaciones.certificaciones, name='certificacion'),
    
    path('periodos-matriculados/', periodos_matriculados,
         name='periodos_matriculados'),
    
    path('periodos-carreras-matriculados/', periodos_carreras_matriculados,
         name='periodos_carreras_matriculados'),
    
    path('datos-factura/', datos_factura,
         name='datos_factura'),
    
    path("change-password-microsoft/",
         cambioContrasenaMicrosoft.password_view, name='change_password_microsoft'),
    
    path("cambio-api-microsoft/",
         cambioApiMicrosoft.api_cambio, name='cambio_api_microsoft'),
    
    path("redirect-moodle/",
         redirectMoodle.redirect_moodle, name='redirect_moodle'),
    
    path('<str:type>/mobile/', mobileMenu.menu_view, name='mobile'),
    
    path("redirect-onedrive/",
         redirectOneDrive.redirect_onedrive, name='redirect_onedrive'),
    
    path("redirect-outlook/",
         redirectOutlook.redirect_outlook, name='redirect_outlook'),
    
    path("isWebView/",isWebView, name='isWebView'),
]
