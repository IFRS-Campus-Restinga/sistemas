import uuid
from django.db import models
from .subject import Subject
from .course import Course

class PPC(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100, unique=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.title

class PPCSubject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ppc = models.ForeignKey(PPC, on_delete=models.CASCADE, related_name='ppc_subject')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='ppc')
    subject_teach_workload = models.IntegerField()
    subject_ext_workload = models.IntegerField()
    subject_remote_workload = models.IntegerField()
    weekly_periods = models.IntegerField()
    pre_requisits = models.ManyToManyField(Subject)

    @property
    def total_workload(self):
        return (
            self.subject_teach_workload +
            self.subject_ext_workload +
            self.subject_remote_workload
        )
    
    @property
    def real_teach_workload(self):
        return self.subject_teach_workload * 0.83333333
    
    @property
    def real_ext_workload(self):
        return self.subject_ext_workload * 0.83333333
    
    @property
    def real_remote_workload(self):
        return self.subject_remote_workload * 0.83333333