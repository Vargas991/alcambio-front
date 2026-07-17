import { IconType } from 'react-icons';

type StatCardColor = 'blue' | 'pink' | 'green' | 'orange' | 'red' | 'gray';

type StatCardProps = {
  title: string;
  value: string;
  description?: string;
  trend?: string;
  trendColor?: 'green' | 'red' | 'gray';
  icon: IconType;
  color?: StatCardColor;
};

const colorClasses: Record<StatCardColor, string> = {
  blue: 'from-blue-600 to-blue-400 shadow-blue-500/40',
  pink: 'from-pink-600 to-pink-400 shadow-pink-500/40',
  green: 'from-green-600 to-green-400 shadow-green-500/40',
  orange: 'from-orange-600 to-orange-400 shadow-orange-500/40',
  red: 'from-red-600 to-red-400 shadow-red-500/40',
  gray: 'from-gray-700 to-gray-500 shadow-gray-500/40',
};

const trendClasses = {
  green: 'text-green-500',
  red: 'text-red-500',
  gray: 'text-gray-500',
};

export function StatCard({
  title,
  value,
  description,
  trend,
  trendColor = 'gray',
  icon: Icon,
  color = 'blue',
}: StatCardProps) {
  return (
    <div className="relative flex flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md">
      <div
        className={[
          'absolute -mt-4 ml-4 grid h-16 w-16 place-items-center overflow-hidden rounded-xl bg-gradient-to-tr text-white shadow-lg',
          colorClasses[color],
        ].join(' ')}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>

      <div className="p-4 text-right">
        <p className="font-sans text-sm font-normal leading-normal text-gray-600">
          {title}
        </p>

        <h4 className="font-sans text-2xl font-semibold leading-snug tracking-normal text-gray-900">
          {value}
        </h4>
      </div>

      {(description || trend) && (
        <div className="border-t border-gray-100 p-4">
          <p className="font-sans text-base font-normal leading-relaxed text-gray-600">
            {trend && (
              <>
                <strong className={trendClasses[trendColor]}>
                  {trend}
                </strong>
                &nbsp;
              </>
            )}
            {description}
          </p>
        </div>
      )}
    </div>
  );
}