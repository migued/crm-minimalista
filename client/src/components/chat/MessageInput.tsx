import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon, 
  PaperClipIcon, 
  FaceSmileIcon,
  DocumentTextIcon, 
  MicrophoneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendTemplate?: () => void;
  onAttachFile?: (file: File) => void;
  isWhatsApp?: boolean;
  isWindowActive?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendTemplate,
  onAttachFile,
  isWhatsApp = false,
  isWindowActive = true,
  isLoading = false,
  disabled = false,
  placeholder = 'Escribe un mensaje...'
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus el input cuando se monta el componente
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  // Ajustar altura del textarea automáticamente
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSendMessage = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      
      // Resetear altura del textarea
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onAttachFile) {
      setFile(files[0]);
      // No llamar onAttachFile todavía para permitir al usuario revisar el archivo
    }
    
    // Resetear el input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = '';
  };

  const handleConfirmAttachment = () => {
    if (file && onAttachFile) {
      onAttachFile(file);
      setFile(null);
    }
  };

  const handleCancelAttachment = () => {
    setFile(null);
  };

  const handleRecordAudio = () => {
    // Aquí iría la lógica para grabar audio
    // Por ahora solo simulamos
    setIsRecording(!isRecording);
  };

  const renderFilePreview = () => {
    if (!file) return null;

    let preview;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');

    if (isImage) {
      const url = URL.createObjectURL(file);
      preview = (
        <img 
          src={url} 
          alt="Vista previa" 
          className="h-20 w-auto object-contain rounded"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      );
    } else if (isVideo) {
      const url = URL.createObjectURL(file);
      preview = (
        <video 
          src={url} 
          className="h-20 w-auto object-contain rounded"
          controls
          onLoad={() => URL.revokeObjectURL(url)}
        />
      );
    } else if (isAudio) {
      const url = URL.createObjectURL(file);
      preview = (
        <audio 
          src={url} 
          className="w-full"
          controls
          onLoad={() => URL.revokeObjectURL(url)}
        />
      );
    } else {
      preview = (
        <div className="flex items-center">
          <DocumentTextIcon className="h-8 w-8 text-gray-500 mr-2" />
          <span className="text-sm text-gray-700 truncate max-w-xs">
            {file.name}
          </span>
        </div>
      );
    }

    return (
      <div className="p-3 border-t border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-sm font-medium text-gray-700">Adjunto</h4>
          <button 
            type="button"
            className="text-gray-400 hover:text-gray-600"
            onClick={handleCancelAttachment}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 mr-3">
            {preview}
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirmAttachment}
          >
            Enviar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Preview del archivo si hay */}
      {renderFilePreview()}
      
      {/* Input de mensaje */}
      <div className="p-3 border-t border-gray-200">
        {isRecording ? (
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm text-gray-600">Grabando audio...</span>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600"
                onClick={handleRecordAudio}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="p-2 text-red-500 hover:text-red-600"
                onClick={handleRecordAudio}
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-end">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 mr-2"
              onClick={handleAttachClick}
              disabled={disabled}
            >
              <PaperClipIcon className="h-5 w-5" />
            </button>
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            
            {isWhatsApp && onSendTemplate && (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 mr-2"
                onClick={onSendTemplate}
                disabled={disabled}
              >
                <DocumentTextIcon className="h-5 w-5" />
              </button>
            )}
            
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 mr-2"
              onClick={handleRecordAudio}
              disabled={disabled}
            >
              <MicrophoneIcon className="h-5 w-5" />
            </button>
            
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 mr-2"
              disabled={disabled}
            >
              <FaceSmileIcon className="h-5 w-5" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={
                  !isWindowActive && isWhatsApp
                    ? 'Solo puedes enviar mensajes de plantilla fuera de la ventana de 24 horas'
                    : placeholder
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={disabled || (!isWindowActive && isWhatsApp)}
              />
            </div>
            
            <button
              type="button"
              className={`ml-2 p-2 rounded-full focus:outline-none ${
                message.trim() && !disabled
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleSendMessage}
              disabled={!message.trim() || disabled}
            >
              {isLoading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Nota sobre WhatsApp */}
      {isWhatsApp && (
        <div className="px-3 pb-2 text-xs text-gray-500">
          <span className="flex items-center">
            <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.036c.101-.108.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.288.131.332.202.043.72.043.433-.101.824z"/>
            </svg>
            {isWindowActive 
              ? 'Ventana de 24 horas activa' 
              : 'Solo puedes enviar mensajes de plantilla fuera de la ventana de 24 horas'}
          </span>
        </div>
      )}
    </div>
  );
};

export default MessageInput;