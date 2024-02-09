import { Signal } from "easybox"
import { Process } from "../core/Process"
import { ITranslator, Language, Stage, TranslatorData, TranslatorEvent } from "../core/App"

export class LibreTranslator implements ITranslator{
    private languageCache: Language[]
    private signal: Signal<TranslatorEvent, TranslatorData>

    constructor(){
        this.signal = new Signal()
        this.languageCache = []
        this.fetchLanguages().then(languages => {
            this.languageCache = [...languages]
            this.signal.emit("languages-loaded", null)
        })
    }
    getLanguage(code: string): Language | undefined {
        return this.languageCache.find(l => l.code == code)
    }
    getLanguages(): Language[] {
        return [...this.languageCache]
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

    /**
     * Split to paragraphs
     * Sprit to chunks
     * Translate chunks
     * Join chunks to paragraphs
     * Join paragraphs to output
     */

    private async  translateStage(input: string, source: Language, target: Language){
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

    private async fetchLanguages(){
        const res = await fetch("https://cs.libretranslate.com/languages", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        })
        const response: Language[] = await res.json()
        return response
    }
    private async translateChunk(input: string, source: Language, target: Language): Promise<string>{
        const res = await fetch("https://cs.libretranslate.com/translate", {
            method: "POST",
            body: JSON.stringify({
                q: input,
                source: source.code,
                target: target.code,
                format: "text",
                api_key: ""
            }),
            headers: { "Content-Type": "application/json" }
        });
        const response = await res.json()

        if(response){
             if(response.error) return response.error   
             else return response.translatedText
        }
        else return "error"
    }
}