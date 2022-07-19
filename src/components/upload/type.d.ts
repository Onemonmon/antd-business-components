export type FileChunkType = {
  id: string;
  filename: string;
  chunk: Blob;
  hash: string;
  index: number;
  size: number;
  percentage: number;
};

export interface IUploadProps {
  size: number; // 切片大小，默认10KB
}
