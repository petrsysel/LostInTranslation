import { Process } from "./Process"

export type ControlPanelEvent = "add-stage" | "remove-stage" | "translate"
export type ControlPanelData = {
    langCode?: string
    stageId?: string
}
export interface IControlPanelUI{
    on(event: ControlPanelEvent, callback: (data: ControlPanelData) => void): void
    render(process: Process, loadedLangueages: Language[]): void
}
export interface IInputTextUI{
    getContent(): string
    clear(): void
}
export interface IOutputTextUI{
    render(content: string): void
    clear(): void
}
export interface IProgressBarUI{
    show(progress: number): void
    updateProgess(progress: number): void
    hide(): void
}
export type TranslatorEvent = "progress-changed" | "languages-loaded"
export type TranslatorData = {
    progress: number
} | null
export interface ITranslator{
    getLanguages(): Language[]
    getLanguage(code: string): Language | undefined
    getTargets(code: string): string[] | undefined
    translate(input: string, process: Process): Promise<string>
    on(event: TranslatorEvent, callback: (data: TranslatorData) => void): void
}
export type Language = {
    code: string,
    name: string
}
export type Chunk = string
export type Stage = {
    language: Language,
    id: string
}


export class App{
    constructor(
        controlPanel: IControlPanelUI,
        inputText: IInputTextUI,
        outputText: IOutputTextUI,
        progressBar: IProgressBarUI,
        translator: ITranslator,

        process: Process
    ){
        controlPanel.render(process, translator.getLanguages())
        controlPanel.on('add-stage', data => {
            process.addStage(translator.getLanguage(data.langCode!)!)
            console.log("adding stage")
            controlPanel.render(process, translator.getLanguages())
        })
        controlPanel.on('remove-stage', data => {
            process.removeStage(data.stageId!)
            controlPanel.render(process, translator.getLanguages())
        })
        controlPanel.on('translate', async () => {
            const input = inputText.getContent()
            const result = await translator.translate(input, process)
            outputText.clear()
            outputText.render(result)
        })
    }
}