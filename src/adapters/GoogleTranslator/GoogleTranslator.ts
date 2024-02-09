import { Signal } from "easybox";
import { ITranslator, Language, TranslatorData, TranslatorEvent } from "../../core/App";
import { Process } from "../../core/Process";
import { supportedLanguages } from "./supportedLanguages";
import translate from 'google-translate-api-browser'

export class GoogleTranslator implements ITranslator{
    private languageCache: Language[]
    private signal: Signal<TranslatorEvent, TranslatorData>

    constructor(){
        this.languageCache = [...supportedLanguages]
        this.signal = new Signal()
        setTimeout(() => {
            this.signal.emit('languages-loaded', null)
            
        }, 200)
    }

    getLanguage(code: string): Language | undefined {
        return this.languageCache.find(l => l.code === code)
    }
    getLanguages(): Language[] {
        const languages = [...this.languageCache]
        return languages
    }
    getTargets(code: string): string[] | undefined {
        return this.getLanguages().map(l => l.code)
    }
    on(event: TranslatorEvent, callback: (data: TranslatorData) => void): void {
        this.signal.on(event, callback)
    }
    translate(input: string, process: Process): Promise<string> {
        return new Promise((resolve, reject) => {
            const fullProcess = process.completeProcess()
            const cz = fullProcess[0].language
            const target = fullProcess[1].language
            const translatedStage = this.translateStage(input, cz, target)
            resolve(translatedStage)
        })
    }

    private async translateStage(input: string, source: Language, target: Language){
        const paragraphs = this.splitToParagraphs(input)
        const translatedParagraphs = await Promise.all(paragraphs.map(async p => {
            const chunks = this.splitToChunks(p, 1500)
            const translatedChunks = await Promise.all(chunks.map(async ch => {
                const translated = await this.translateChunk(ch, source, target)
                return translated
            }))
            return translatedChunks.join(' ')
        }))
        return translatedParagraphs.join('\n')
    }

    private splitToChunks(input: string, maxLenght: number) {
        const slova = input.split(' ');
        const rozdeleno: string[] = [];
        let aktualniPodretezec = '';
        slova.forEach(slovo => {
          if ((aktualniPodretezec + slovo).length <= maxLenght) {
            aktualniPodretezec += `${slovo} `;
          } else {
            rozdeleno.push(`${aktualniPodretezec}`);
            aktualniPodretezec = `${slovo} `;
          }
        });
      
        // Přidej poslední zbylé slova
        if (aktualniPodretezec.length > 0) {
          rozdeleno.push(`${aktualniPodretezec}`);
        }
      
        return rozdeleno;
    }

    private splitToParagraphs(input: string) {
        const paragraphs = input.split('\n');
        
        return paragraphs;
    }

    private async translateChunk(input: string, source: Language, target: Language): Promise<string>{
        return new Promise((resolve, reject) => {
            translate('I speak Dutch!', {from: 'en', to: 'nl', corsUrl: "https://cors-anywhere.herokuapp.com/"}).then((res: any) => {
                console.log(res.text);
                //=> Ik spreek Nederlands!
                console.log(res.from.text.autoCorrected);
                //=> true
                console.log(res.from.text.value);
                //=> I [speak] Dutch!
                console.log(res.from.text.didYouMean);
                resolve(res.text)
                //=> false
            }).catch((err: any) => {
                console.error(err)
            });
        })
    }
}