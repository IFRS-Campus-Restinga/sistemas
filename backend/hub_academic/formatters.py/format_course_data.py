from ..models.course import Course

class FormatCourseData:
    @staticmethod
    def list_format(course: Course):
        return {
            'id': course.id,
            'nome': course.name,
            'modalidade': course.category,
            'carga_horária': course.workload,
            'coordenador': course.coord.email,
        }
    
    @staticmethod
    def details_format(course: Course):
        return {
            'id': course.id,
            'name': course.name,
            'category': course.category,
            'workload': course.workload,
            'coord': {'id': course.coord.id, 'email': course.coord.email},
            'classes': [{'id': course_class.id, 'number': course_class.number, 'course': course.id} for course_class in course.course_class.all()]
        }