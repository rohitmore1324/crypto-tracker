import { useEffect, useRef } from 'react'
import { createChart, ColorType, IChartApi } from 'lightweight-charts'

interface PriceChartProps {
    data: {
        time: string
        value: number
    }[]
    color?: string
    height?: number
}

const PriceChart = ({ data, color = '#2962FF', height = 100 }: PriceChartProps) => {
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)

    useEffect(() => {
        if (chartContainerRef.current) {
            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: 'transparent' },
                    textColor: '#d1d4dc',
                },
                grid: {
                    vertLines: { color: 'rgba(42, 46, 57, 0.1)' },
                    horzLines: { color: 'rgba(42, 46, 57, 0.1)' },
                },
                width: chartContainerRef.current.clientWidth,
                height,
                timeScale: {
                    timeVisible: false,
                    secondsVisible: false,
                },
            })

            const lineSeries = chart.addLineSeries({
                color,
                lineWidth: 2,
                priceLineVisible: false,
                lastValueVisible: false,
            })

            lineSeries.setData(data)
            chartRef.current = chart

            const handleResize = () => {
                if (chartContainerRef.current) {
                    chart.applyOptions({
                        width: chartContainerRef.current.clientWidth,
                    })
                }
            }

            window.addEventListener('resize', handleResize)

            return () => {
                window.removeEventListener('resize', handleResize)
                chart.remove()
            }
        }
    }, [data, color, height])

    return <div ref={chartContainerRef} className="w-full" />
}

export default PriceChart 