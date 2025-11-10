import { ResponsiveBar } from '@nivo/bar'

interface NivoBarChartProps {
  data: any[]
  keys: string[]
  indexBy: string
  title?: string
  colors?: string[]
  margin?: { top: number; right: number; bottom: number; left: number }
}

export default function NivoBarChart({
  data,
  keys,
  indexBy,
  title,
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'],
  margin = { top: 50, right: 130, bottom: 50, left: 60 },
}: NivoBarChartProps) {
  return (
    <div className="w-full h-full min-h-[400px]">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveBar
        data={data}
        keys={keys}
        indexBy={indexBy}
        margin={margin}
        padding={0.3}
        colors={colors}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: indexBy,
          legendPosition: 'middle' as const,
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'count',
          legendPosition: 'middle' as const,
          legendOffset: -40,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right' as const,
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
        animate={true}
        motionConfig="wobbly"
      />
    </div>
  )
}
