import { DomHelper, Signal } from "easybox";
import { Process } from "../core/Process";
import { ControlPanelData, ControlPanelEvent, IControlPanelUI, Language } from "../core/App";

export class ControlPanel implements IControlPanelUI{
    private signal: Signal<ControlPanelEvent, ControlPanelData>

    private stagesElement: HTMLElement = DomHelper.get('stages')!
    private targetSelect: HTMLSelectElement = DomHelper.get('new-stage-select') as HTMLSelectElement
    private addStageButton: HTMLButtonElement = DomHelper.get('new-stage-add-button') as HTMLButtonElement
    private translateButton: HTMLButtonElement = DomHelper.get('translate-button') as HTMLButtonElement

    constructor(){
        this.signal = new Signal()
        this.addStageButton.addEventListener('click', () => {
            const code = this.targetSelect.selectedOptions[0].dataset.code!
            this.signal.emit('add-stage', {
                langCode: code
            })
        })
        this.translateButton.addEventListener('click', () => {
            this.signal.emit('translate', {})
        })
    }
    on(event: ControlPanelEvent, callback: (data: ControlPanelData) => void): void {
        this.signal.on(event, callback)
    }
    render(process: Process, loadedLangueages: Language[]): void {
        this.stagesElement. innerHTML = ""
        this.renderStages(process)
        this.renderNewStage(process, loadedLangueages)
    }

    private renderNewStage(process: Process, loadedLangueages: Language[]){
        console.log(loadedLangueages)
        this.targetSelect.innerHTML = ""
        const lastLang = (process.getStages().length === 0) ? process.getBaseLang() : process.getStages()[process.getStages().length-1].language
        loadedLangueages.forEach(t => {
            const option = DomHelper.make('option') as HTMLOptionElement
            option.dataset.code = t.code
            option.innerHTML = loadedLangueages.find(l => l.code === t.code)?.name!
            this.targetSelect.appendChild(option)
            if(t.code === lastLang.code) option.selected = true
        })
    }

    private renderStages(process: Process){
        process.getStages().forEach(s => {
            const stageElement = DomHelper.makeDiv()
            const stageLabel = DomHelper.make('p') as HTMLParagraphElement
            stageLabel.innerHTML = s.language.name
            const stageRemoveBtn = DomHelper.make('button') as HTMLButtonElement
            stageRemoveBtn.innerHTML = "Odebrat"
            stageElement.classList.add('stage')
            stageElement.append(
                stageLabel,
                stageRemoveBtn
            )
            this.stagesElement.appendChild(stageElement)
            stageRemoveBtn.addEventListener('click', () => {
                this.signal.emit('remove-stage', {
                    stageId: s.id
                })
            })
        })
    }
}