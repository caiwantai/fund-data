import React from 'react';

interface FileManagerProps {
  availableDates: string[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  availableFiles: string[];
  selectedFile: string;
  onFileChange: (file: string) => void;
  fileContent: string;
  fileName: string;
  csvData: any[];
  error: string;
  onDownloadData: () => void;
  onRefreshFiles: () => void;
  onDeleteFile: () => void;
  isDownloading: boolean;
}

const FileManager: React.FC<FileManagerProps> = ({
  availableDates,
  selectedDate,
  onDateChange,
  availableFiles,
  selectedFile,
  onFileChange,
  fileContent,
  fileName,
  csvData,
  error,
  onDownloadData,
  onRefreshFiles,
  onDeleteFile,
  isDownloading
}) => {
  return (
    <div>
      <div className="row mb-5 g-3">
        <div className="col-md-6">
          <button 
            onClick={onDownloadData} 
            className="btn btn-success btn-lg w-100 py-3"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                下载中...
              </>
            ) : (
              "下载基金数据"
            )}
          </button>
        </div>
        <div className="col-md-6">
          <button 
            onClick={onRefreshFiles} 
            className="btn btn-info btn-lg w-100 py-3"
          >
            刷新基金数据
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileManager;
