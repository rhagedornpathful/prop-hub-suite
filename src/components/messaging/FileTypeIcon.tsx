import React from 'react';
import { 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileSpreadsheet, 
  FileCode,
  FileArchive,
  File,
  Paperclip
} from 'lucide-react';

interface FileTypeIconProps {
  fileName: string;
  fileType?: string;
  className?: string;
}

export const FileTypeIcon: React.FC<FileTypeIconProps> = ({ 
  fileName, 
  fileType,
  className = "h-5 w-5"
}) => {
  const getIconForFile = () => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const type = fileType?.toLowerCase();

    // Images
    if (type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <FileImage className={className} />;
    }

    // Videos
    if (type?.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) {
      return <FileVideo className={className} />;
    }

    // Audio
    if (type?.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(extension || '')) {
      return <FileAudio className={className} />;
    }

    // Documents
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension || '')) {
      return <FileText className={className} />;
    }

    // Spreadsheets
    if (['xls', 'xlsx', 'csv', 'ods'].includes(extension || '')) {
      return <FileSpreadsheet className={className} />;
    }

    // Code
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml'].includes(extension || '')) {
      return <FileCode className={className} />;
    }

    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return <FileArchive className={className} />;
    }

    // Default
    return <File className={className} />;
  };

  return getIconForFile();
};
