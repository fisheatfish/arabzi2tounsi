import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ChapterSection({
  id,
  lessonNum,
  title,
  titleAccent,
  subtitle,
  description,
  points,
  takeaway,
  bgColor = '#FFFDF5',
  accentColor = '#FFD93D',
  textureClass = 'texture-grid',
  leftContent,
  rightContent,
  badgeRotate = 'rotate-1',
}) {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const leftRef = useRef(null)
  const rightRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title reveal
      gsap.fromTo(titleRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
            once: true,
          }
        }
      )

      // Left content
      if (leftRef.current) {
        gsap.fromTo(leftRef.current.children,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out',
            scrollTrigger: {
              trigger: leftRef.current,
              start: 'top 80%',
              once: true,
            }
          }
        )
      }

      // Right content
      if (rightRef.current) {
        gsap.fromTo(rightRef.current,
          { x: 30, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.6, ease: 'power2.out',
            scrollTrigger: {
              trigger: rightRef.current,
              start: 'top 80%',
              once: true,
            }
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id={id}
      ref={sectionRef}
      className="chapter-section"
      style={{ background: bgColor }}
    >
      {/* Texture overlay */}
      <div
        className={`absolute inset-0 ${textureClass} pointer-events-none`}
        style={{ opacity: 0.35 }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 md:py-32">
        {/* Header */}
        <div ref={titleRef} className="mb-12 md:mb-16">
          <div
            className={`neo-badge mb-4 inline-block ${badgeRotate}`}
            style={{ background: accentColor }}
          >
            {lessonNum}
          </div>
          <h2 className="text-4xl md:text-6xl font-black leading-tight mb-4">
            {title}<br />
            <span style={{ WebkitTextStroke: '3px #0f0f0f', color: 'transparent' }}>
              {titleAccent}
            </span>
          </h2>
          {subtitle && (
            <p className="text-lg font-medium text-ink/60 max-w-xl">{subtitle}</p>
          )}
        </div>

        {/* Two-col content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-start">
          {/* Left: text + points */}
          <div ref={leftRef} className="space-y-6">
            {description && (
              <p className="text-base font-medium leading-relaxed text-ink/80 max-w-lg">
                {description}
              </p>
            )}

            {points && points.length > 0 && (
              <div className="space-y-3">
                {points.map((pt, i) => (
                  <div key={i} className="neo-card-sm p-4 flex gap-3">
                    <div
                      className="w-7 h-7 shrink-0 border-2 border-ink flex items-center justify-center font-black text-sm"
                      style={{ background: accentColor }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-black text-sm">{pt.title}</div>
                      <div className="text-sm text-ink/60 mt-0.5">{pt.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {leftContent}

            {takeaway && (
              <div className="neo-card-dark p-5">
                <div
                  className="text-xs font-black uppercase tracking-widest mb-2"
                  style={{ color: accentColor }}
                >
                  À retenir
                </div>
                <p className="text-sm font-medium text-cream/90 leading-relaxed">{takeaway}</p>
              </div>
            )}
          </div>

          {/* Right: interactive demo */}
          <div ref={rightRef}>
            {rightContent}
          </div>
        </div>
      </div>
    </section>
  )
}
