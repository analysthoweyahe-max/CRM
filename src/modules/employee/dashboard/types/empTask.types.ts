export interface EmpTask {
  id:       string;
  titleAr:  string;
  titleEn:  string;
  project:  string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}
