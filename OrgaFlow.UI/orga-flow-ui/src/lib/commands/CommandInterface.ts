export interface ICommand {
    execute(): Promise<any>;
    undo(): Promise<boolean>;
    redo?(): Promise<any>;
}