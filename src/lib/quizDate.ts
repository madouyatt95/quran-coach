/** The daily challenge follows the calendar day of the device, including DST. */
export function quizDay(date=new Date()):string {
 return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
