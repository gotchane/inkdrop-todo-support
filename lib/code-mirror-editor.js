'use babel'

import { Disposable, CompositeDisposable } from 'event-kit'

const NAMESPACE = 'todo-toggle'
export class CodeMirrorEditor extends Disposable {
    constructor(cm) {
        super(() => this.destroy())
        this.subscriptions = new CompositeDisposable()
        this.cm = cm
        this.registerCommand('mark', () => this.markTodo())
    }

    markTodo() {
        console.log('mark todo')
    }

    registerCommand(command, callback) {
        console.log(`${NAMESPACE}:${command}`)
        const targetElement = this.cm.display.wrapper
        this.subscriptions.add(
            inkdrop.commands.add(targetElement, {
                [`${NAMESPACE}:${command}`]: () => {
                    callback()
                }
            })
        )
    }

    destroy() {
        this.subscriptions.dispose()
    }
}