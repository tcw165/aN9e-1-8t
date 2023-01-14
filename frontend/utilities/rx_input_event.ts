import { Observable, fromEvent, startWith } from "rxjs";

export function inputEventInt$(dom: HTMLInputElement): Observable<number> {
  return fromEvent(dom, 'input', (evt) => parseInt((evt.target! as HTMLInputElement).value))
    .pipe(
      startWith(parseInt(dom.value)),
    );
}

export function inputEvent$(dom: HTMLInputElement): Observable<string> {
  return fromEvent(dom, 'change', (evt) => (evt.target! as HTMLInputElement).value)
    .pipe(
      startWith(dom.value),
    );
}