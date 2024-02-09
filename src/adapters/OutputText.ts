import { DomHelper } from "easybox";
import { IOutputTextUI } from "../core/App";

export class OutputText implements IOutputTextUI{
    outputPlaceholder: HTMLParagraphElement = DomHelper.get('output-placeholder') as HTMLParagraphElement
    
    clear(): void {
        this.outputPlaceholder.innerHTML = ""
    }
    render(content: string): void {
        this.outputPlaceholder.innerHTML = content
    }
}