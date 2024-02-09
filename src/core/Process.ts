import { Language, Stage } from "./App"

export class Process{
    private stages: Stage[]
    private baseLang: Language
    
    private targetLang: Language

    constructor(baseLang: Language, targetLang: Language){
        this.baseLang = baseLang
        this.targetLang = targetLang
        this.stages = []
    }
    getStages(){
        return [...this.stages]
    }

    clear(){
        this.stages = []
    }
    getBaseLang(){
        return this.baseLang
    }

    addStage(language: Language){
        this.stages.push({
            id: crypto.randomUUID(),
            language: language
        })
    }
    removeStage(id: string){
        this.stages = this.stages.filter(s => s.id !== id)
    }
    completeProcess(){
        const baseStage: Stage = {
            id: crypto.randomUUID(),
            language: this.baseLang
        }
        const targetStage: Stage = {
            id: crypto.randomUUID(),
            language: this.targetLang
        }
        return [baseStage, ...this.stages, targetStage]
    }
}