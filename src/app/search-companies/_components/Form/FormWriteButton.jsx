export default function FormWriteButton({ onCancelClick, onSubmitClick }) {
  return (
    <div>
        <button type="button" onClick={onCancelClick}>
        취소
        </button>
        <button type="button" onClick={onSubmitClick}>
        작성 완료
        </button>

    </div>
  );
}