/**
 * HomepageRenderer — renders all sections from CMS config (HOMEPAGE_BUILDER_ARCHITECTURE §5.1)
 * Iterates through sections and renders each using the Section Registry.
 */

import { getSectionComponentByType } from '../lib/dynamic-loader';
import type { HomepageConfig } from '../types';

import { SectionWrapper } from './SectionWrapper';

interface HomepageRendererProps {
  config: HomepageConfig;
}

export function HomepageRenderer({ config }: HomepageRendererProps) {
  return (
    <div className="w-full">
      {config.sections.map((section, index) => {
        const SectionComponent = getSectionComponentByType(section.type);

        if (!SectionComponent) {
          console.warn(`Unknown section type: ${section.type}`);
          return null;
        }

        return (
          <SectionWrapper key={section.id} section={section} index={index}>
            <SectionComponent
              id={section.id}
              config={section.config}
              index={index}
            />
          </SectionWrapper>
        );
      })}
    </div>
  );
}
