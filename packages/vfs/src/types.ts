export interface VfsFile {
    path: string;
    content: string;
    /** Unix epoch millis when the file was last written */
    updatedAt: number;
}

export interface VfsSnapshot {
    projectId: string;
    files: VfsFile[];
    /** Unix epoch millis when the snapshot was taken */
    takenAt: number;
}

export interface VfsChangeEvent {
    type: 'create' | 'update' | 'delete';
    path: string;
}

export type VfsListener = (event: VfsChangeEvent) => void;