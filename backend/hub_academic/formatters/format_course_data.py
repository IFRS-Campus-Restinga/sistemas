from ..models.course import Course

class FormatCourseData:
    @staticmethod
    def list_format(course: Course):
        return {
            'id': course.id,
            'nome': course.name,
            'modalidade': course.category,
            'carga horária': course.workload,
            'coordenador': course.coord.email,
        }
    
    @staticmethod
    def search_format(course: Course):
        return {
            'id': course.id,
            'title': course.name,
        }
    
    @staticmethod
    def details_format(course: Course):
        return {
            'id': course.id,
            'name': course.name,
            'category': course.category,
            'workload': course.workload,
            'coord': {'id': course.coord.id, 'name': f'{course.coord.first_name} {course.coord.last_name}'},
            'classes': [{'id': course_class.id, 'number': course_class.number, 'course': course.id} for course_class in course.course_class.all()]
        }