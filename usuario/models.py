from django.db import models
from django.contrib.auth.models import User
from django.core.files.storage import default_storage

class prospecto(models.Model):
    id_prospecto = models.AutoField(primary_key=True)
    identificacion = models.CharField(max_length=22)
    tipo_identificacion = models.CharField(max_length=2)
    estado_migratorio = models.CharField(max_length=20)
    nombre = models.CharField(max_length=50)
    primer_apellido = models.CharField(max_length=50)
    segundo_apellido = models.CharField(max_length=50)
    fecha_nacimiento = models.DateField()
    numero_telefonico = models.CharField(max_length=22)
    numero_telefonico2 = models.CharField(max_length=22, null=True)
    correo_institucional = models.CharField(max_length=60)
    correo_personal = models.CharField(max_length=60)
    nacionalidad = models.CharField(max_length=20)
    provincia = models.CharField(max_length=20)
    canton = models.CharField(max_length=20)
    distrito = models.CharField(max_length=20)
    direccion_exacta = models.CharField(max_length=500)
    sexo = models.CharField(max_length=15)
    
    def __str__(self):
        return self.identificacion
    
class user_status (models.Model):
    id_user_status = models.AutoField(primary_key=True)
    identificacion = models.CharField(max_length=22)
    activo = models.BooleanField(default=True)
    moroso = models.BooleanField(default=False)
    terminos_condiciones = models.BooleanField(default=False)
    
class user_studies (models.Model):
    id_user_studies = models.AutoField(primary_key=True)
    identificacion = models.CharField(max_length=22)
    estudio = models.CharField(max_length=300)
    formulario = models.BooleanField(default=False)
    prematricula_envio = models.BooleanField(default=False)
    prematricula = models.BooleanField(default=False)
    matricula = models.BooleanField(default=False)
    cursando = models.BooleanField(default=False)

class RegistroLogsUser (models.Model):
    fechatiempo = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(User,
                            on_delete=models.CASCADE,
                            null=True,
                            blank=True)
    accion = models.CharField(max_length=300)
    
class RegistroIDUserCambios (models.Model):
    fechatiempo = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(User,
                            on_delete=models.CASCADE,
                            null=True,
                            blank=True)
    tipo_ident_nueva = models.CharField(max_length=25)
    nueva_identificacion = models.CharField(max_length=25)
    antigua_identifiacion = models.CharField(max_length=25)
    tipo_ident_antigua = models.CharField(max_length=25)
    
class fotoperfil(models.Model):
    user = models.ForeignKey(User,
                            on_delete=models.CASCADE,
                            null=True,
                            blank=True)
    archivo = models.BinaryField() 
    
class estados (models.Model):
    id_estado = models.AutoField(primary_key=True)
    estado_nombre = models.CharField(max_length=30)
    
class primerIngreso (models.Model):
    id_fase = models.AutoField(primary_key=True)
    estado = models.CharField(max_length=55)
    convalidacion = models.BooleanField(default=False)
    usuario = models.ForeignKey(User,
                            on_delete=models.CASCADE,
                            null=True,
                            blank=True)
    comentario = models.TextField(max_length=500)
    
class documentos (models.Model):
    id_documento = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(User,
                            on_delete=models.CASCADE,
                            blank=True)
    docTitulo = models.CharField(max_length=25)
    docTituloUniversitario = models.CharField(max_length=25)
    docIdentificacion = models.CharField(max_length=25)
    docFotoPasaporte = models.CharField(max_length=25)
    docMateriasAprobadas = models.CharField(max_length=25)
    docPlanEstudios = models.CharField(max_length=25)
  
class inclusivo(models.Model):
    id_inclusivo = models.AutoField(primary_key=True)
    identificacion = models.CharField(max_length=25)
    sexo = models.CharField(max_length=50)
    trato = models.CharField(max_length=60)

class imagenNoticia(models.Model):
    id = models.AutoField(primary_key=True)
    imagen = models.BinaryField(null=True, blank=True)
    imagen_nombre = models.CharField(max_length=255, null=True, blank=True)
    estudiante = models.BooleanField(default=False)
    profesor = models.BooleanField(default=False)
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
    hora_inicio = models.TimeField(null=True, blank=True)
    hora_fin = models.TimeField(null=True, blank=True)
    destacada = models.BooleanField(default=False)
    
class noticias(models.Model):
    id = models.AutoField(primary_key=True)
    imagen = models.BinaryField(null=True, blank=True)
    imagen_nombre = models.CharField(max_length=255, null=True, blank=True)
    titulo = models.TextField(null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    estudiante = models.BooleanField(default=False)
    profesor = models.BooleanField(default=False)
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
    hora_inicio = models.TimeField(null=True, blank=True)
    hora_fin = models.TimeField(null=True, blank=True)

class colegios (models.Model):
    nombre_colegio = models.CharField(max_length=100)
    id = models.AutoField(primary_key=True)
      
class universidades (models.Model):
    nombre_universidad = models.CharField(max_length=200)
    id = models.AutoField(primary_key=True)
      
class urls_dspace (models.Model):
    id_urls = models.AutoField(primary_key=True)
    id_estudiante = models.CharField(max_length=25)
    tituloeducacion = models.CharField(max_length=500)
    titulouniversitario = models.CharField(max_length=500)
    identificacion = models.CharField(max_length=500)
    fotoperfil = models.CharField(max_length=500)
    record_academico = models.CharField(max_length=500)
    plan_estudio = models.CharField(max_length=500)
    
class moodleUser (models.Model):
    id_moodle = models.AutoField(primary_key=True)
    identificacion = models.CharField(max_length=22)
    password = models.CharField(max_length=500)
    act_datos = models.BooleanField(default=False)

class paises(models.Model):
    id = models.AutoField(primary_key=True)
    nombre_pais = models.CharField(max_length=200)
    
class archivos(models.Model):
    id = models.AutoField(primary_key=True)
    id_user = models.ForeignKey(User, on_delete=models.CASCADE)
    nombre_archivo = models.CharField(max_length=200)   
    archivo = models.BinaryField() 
    extension = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=200)
    aprobado = models.BooleanField(default=False)