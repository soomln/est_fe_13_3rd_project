import Tab from '../Tab';

import styles from './TabGroup.module.sass';

const TABS = [
  { id: 'overview', iconText: 'auto_awesome' },
  { id: 'code', iconText: 'code' },
  // { id: 'document', iconText: 'article' },
];

export default function TabGroup({ bgColor, activeTab, onChangeTab }) {
  return (
    <div className={styles.tab_group}>
      {TABS.map((tab) => (
        <Tab
          key={tab.id}
          iconText={tab.iconText}
          activeBgColor={bgColor}
          isActive={activeTab === tab.id}
          onChangeTab={() => {
            onChangeTab(tab.id);
          }}
        />
      ))}
    </div>
  );
}
