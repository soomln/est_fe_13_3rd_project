import Tab from '@/app/portfolio/_components/Modal/Tab';

const TABS = [
  { id: 'ai', iconText: 'auto_awesome' },
  { id: 'document', iconText: 'article' },
  { id: 'code', iconText: 'code' },
];

export default function TabGroup({ activeTab, onChangeTab }) {
  return (
    <div>
      {TABS.map((tab) => (
        <Tab
          key={tab.id}
          iconText={tab.iconText}
          isActive={activeTab === tab.id}
          onChangeTab={() => {
            onChangeTab(tab.id);
          }}
        />
      ))}
    </div>
  );
}
