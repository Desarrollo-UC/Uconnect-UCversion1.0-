from .models import *

class files_manager():
    def save_files(request, files):
        user = request.user
        for dt in files:
            record = files[dt]
            archivo_subido = record['archivo']
            
            # Leer el contenido del archivo subido
            contenido_binario = archivo_subido.read()
            
            archivos.objects.create(
                id_user=user, 
                nombre_archivo=record['nombre'], 
                archivo=contenido_binario,  # Almacenar el contenido binario
                extension=record['tipo'], 
                descripcion=record['descripcion']
            )
        return True

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