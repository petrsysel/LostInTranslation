import { DomHelper } from "easybox";
import { IInputTextUI } from "../core/App";

export class InputText implements IInputTextUI{
    private inputElement: HTMLTextAreaElement = DomHelper.get('original-text') as HTMLTextAreaElement

    clear(): void {
        this.inputElement.innerHTML = ""
    }
    getContent(): string {
        return this.inputElement.value
    }
}