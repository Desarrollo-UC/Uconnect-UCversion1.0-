from django import forms
from .models import *
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True, help_text='')

    class Meta:
        model = User
        fields = ('username', 'email', 'password1',
                  'password2', 'first_name', 'last_name')

class FormularioProspecto(forms.ModelForm):
    class Meta:
        model = prospecto
        fields = ('identificacion', 'nombre', 'tipo_identificacion', 'estado_migratorio', 'primer_apellido', 'segundo_apellido', 'fecha_nacimiento', 'numero_telefonico',
                  'numero_telefonico2', 'correo_institucional', 'correo_personal', 'nacionalidad', 'provincia', 'canton', 'distrito', 'direccion_exacta', 'sexo')

class FormularioUserStatus(forms.ModelForm):
    class Meta:
        model = user_status
        fields = ('identificacion', 'activo', 'moroso', 'terminos_condiciones')
        
class FormularioUserStudies(forms.ModelForm):
    class Meta:
        model = user_studies
        fields = ('identificacion', 'estudio', 'formulario', 'prematricula_envio', 'prematricula', 'matricula', 'cursando')

class FormularioPrimerIngreso(forms.ModelForm):
    class Meta:
        model = primerIngreso
        fields = ('estado', 'convalidacion', 'comentario', 'usuario')

class FormularioDocumentos(forms.ModelForm):
    class Meta:
        model = documentos
        fields = ('usuario', 'docTitulo', 'docTituloUniversitario', 'docIdentificacion',
                  'docFotoPasaporte', 'docMateriasAprobadas', 'docPlanEstudios')

class FormularioInclusivo(forms.ModelForm):
    class Meta:
        model = inclusivo
        fields = ('identificacion', 'sexo', 'trato')

class FormularioUrlsDspace(forms.ModelForm):
    class Meta:
        model = urls_dspace
        fields = (
            'id_estudiante',
            'tituloeducacion',
            'titulouniversitario',
            'identificacion',
            'fotoperfil',
            'record_academico',
            'plan_estudio',
        )
        
class FormularioMoodleUser(forms.ModelForm):
    class Meta:
        model = moodleUser
        fields = ('identificacion', 'password', 'act_datos')
