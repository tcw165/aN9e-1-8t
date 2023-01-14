export enum UiStatus {
  BUSY,
  DONE
}

export interface UiEvent {
  status: UiStatus,
  data: object,
}