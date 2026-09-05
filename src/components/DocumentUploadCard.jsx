import { useRef, useState } from 'react';
import { cx } from '../utils/cx';
import { formatFileSize } from '../utils/format';
import { CheckCircleIcon, CameraIcon, FileTextIcon, RefreshIcon, TrashIcon, UploadIcon } from './icons';

const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function readFileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });
}

const MAX_DIMENSION = 900;
const JPEG_QUALITY = 0.72;

async function compressImageDataUrl(dataUrl, type) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);
        const outType = type === 'image/png' ? 'image/jpeg' : 'image/jpeg';
        resolve(canvas.toDataURL(outType, JPEG_QUALITY));
      } catch {
        resolve(dataUrl);
      }
    };
    image.onerror = () => reject(new Error('Could not read the image.'));
    image.src = dataUrl;
  });
}

async function readAndCompress(file) {
  if (file.type.startsWith('image/')) {
    const dataUrl = await readFileDataUrl(file);
    try {
      const compressed = await compressImageDataUrl(dataUrl, file.type);
      return compressed;
    } catch {
      return dataUrl;
    }
  }
  return undefined;
}

export default function DocumentUploadCard({
  title,
  hint = 'JPG / PNG / PDF',
  imageOnly = false,
  large = false,
  cameraOnly = false,
  replaceLabel = 'Replace',
  value,
  onUploaded,
  onRemoved,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || uploading) return;
    setError('');
    setUploaded(false);
    const extension = file.name.split('.').pop().toLowerCase();
    const typeOk = imageOnly
      ? file.type.startsWith('image/')
      : ALLOWED_MIME.includes(file.type) || ALLOWED_EXTENSIONS.includes(extension);
    if (!typeOk) {
      setError(
        imageOnly
          ? 'File type is not supported. Please upload a JPG or PNG image.'
          : 'File type is not supported. Please upload JPG, PNG or PDF.'
      );
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5 MB.');
      return;
    }
    setUploading(true);
    setProgress(0);
    await new Promise((resolve) => {
      let current = 0;
      const timer = setInterval(() => {
        current = Math.min(100, current + 14 + Math.round(Math.random() * 18));
        setProgress(current);
        if (current >= 100) {
          clearInterval(timer);
          resolve();
        }
      }, 110);
    });
    let dataUrl;
    let storedSize = file.size;
    if (file.type.startsWith('image/')) {
      try {
        dataUrl = await readAndCompress(file);
        if (dataUrl) storedSize = Math.round((dataUrl.length * 3) / 4);
      } catch {
        dataUrl = undefined;
      }
    }
    setUploading(false);
    setUploaded(true);
    onUploaded({
      name: file.name,
      size: storedSize,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      dataUrl,
    });
  };

  const handleRemove = () => {
    setError('');
    setUploaded(false);
    onRemoved();
  };

  const isImage = value?.type?.startsWith('image/');
  const UploadIconComponent = large ? CameraIcon : UploadIcon;

  return (
    <div className={cx('upload-card', error && 'upload-card--error', large && 'upload-card--large')}>
      <div className="upload-card__head">
        <h3>{title}</h3>
        {value && <span className="status-chip status-chip--success">Uploaded</span>}
      </div>

      {value ? (
        <div className="upload-card__preview">
          {isImage && value.dataUrl ? (
            <img src={value.dataUrl} alt={title} className="upload-card__thumb" />
          ) : (
            <span className="upload-card__file-icon">
              <FileTextIcon size={22} />
            </span>
          )}
          <div className="upload-card__file">
            <p className="upload-card__name">{value.name}</p>
            <p className="upload-card__meta">{formatFileSize(value.size)}</p>
          </div>
          <div className="upload-card__actions">
            <button
              type="button"
              className="icon-btn icon-btn--sm"
              onClick={openPicker}
              disabled={disabled}
              aria-label={`${replaceLabel} ${title}`}
              title={replaceLabel}
            >
              <RefreshIcon size={16} />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn--sm icon-btn--danger"
              onClick={handleRemove}
              disabled={disabled}
              aria-label={`Remove ${title}`}
              title="Remove"
            >
              <TrashIcon size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={cx('upload-card__dropzone', large && 'upload-card__dropzone--large')}
          onClick={openPicker}
          disabled={disabled || uploading}
        >
          <UploadIconComponent size={large ? 26 : 22} />
          <span>{uploading ? 'Uploading…' : large ? 'Upload Selfie' : 'Upload File'}</span>
          <small>{hint}</small>
        </button>
      )}

      {uploading && (
        <div className="upload-card__progress">
          <div className="progress">
            <div className="progress__bar" style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
        </div>
      )}

      {uploaded && !uploading && (
        <p className="upload-card__success">
          <CheckCircleIcon size={14} /> Document uploaded successfully.
        </p>
      )}

      {error && (
        <p className="field__message field__message--error" role="alert">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={cameraOnly ? 'image/*' : imageOnly ? 'image/jpeg,image/png' : '.jpg,.jpeg,.png,.pdf'}
        capture={cameraOnly ? 'user' : undefined}
        hidden
        onChange={handleFileChange}
      />
    </div>
  );
}
