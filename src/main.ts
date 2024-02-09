import { ControlPanel } from "./adapters/ControlPanel"
import { GoogleTranslator } from "./adapters/GoogleTranslator/GoogleTranslator"
import { InputText } from "./adapters/InputText"
import { LibreTranslator } from "./adapters/LibreTranslator"
import { OutputText } from "./adapters/OutputText"
import { App, IInputTextUI, IOutputTextUI, IProgressBarUI } from "./core/App"
import { Process } from "./core/Process"

function main(){
    const controlPanel = new ControlPanel()
    const inputText = new InputText()
    const outputText = new OutputText()
    const progressBar = {} as IProgressBarUI
    const translator = new GoogleTranslator()
    translator.on('languages-loaded', () => {
        const process = new Process(translator.getLanguage('cs')!, translator.getLanguage('cs')!)
        new App(
            controlPanel,
            inputText,
            outputText,
            progressBar,
            translator,
            process
        )
    })
    
    
}

window.addEventListener('load', () => {
    main()
})