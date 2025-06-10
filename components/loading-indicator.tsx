export function LoadingIndicator({ progress }: { progress: number }) {
  return (
    <div className="flex justify-center items-center h-96">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24" viewBox="0 0 100 100">
          <circle
            className="text-gray-200"
            cx="50"
            cy="50"
            fill="transparent"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
          />
          <circle
            className="text-blue-600"
            cx="50"
            cy="50"
            fill="transparent"
            r="45"
            stroke="currentColor"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            strokeLinecap="round"
            strokeWidth="8"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-semibold">
          {progress}%
        </div>
      </div>
    </div>
  );
}
