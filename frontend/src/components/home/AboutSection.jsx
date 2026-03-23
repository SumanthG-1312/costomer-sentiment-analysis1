import sumanthImg from '../../assets/sumanth.jpg';
import kavyaImg from '../../assets/kavya.jpg';
import rahulImg from '../../assets/rahul.jpg';

const teamInfo = [
  {
    name: "Sumanth Gajjela",
    role: "Frontend Developer & ML Model Developer",
    desc: "Focused on building clean user interfaces and integrating data-driven models for real-world applications.",
    img: sumanthImg,
    link: "https://www.linkedin.com/in/sumanth-gajjela-b6650b26b/"
  },
  {
    name: "Kunchala Kavya",
    role: "Machine Learning Engineer",
    desc: "Worked on model development, segmentation accuracy, and data analysis.",
    img: kavyaImg,
    link: "https://www.linkedin.com/in/kunchala-kavya-375082309/"
  },
  {
    name: "Rahul Pillem",
    role: "Backend Developer",
    desc: "Handled backend architecture, APIs, and data processing workflows.",
    img: rahulImg,
    link: "https://www.linkedin.com/in/rahul-pillem-1a72aa381/"
  }
];

const AboutSection = () => {
  return (
    <section id="about" className="py-32 w-full border-t border-border/40 relative">
      <div className="absolute inset-0 bg-background/50 z-0 pointer-events-none"></div>
      <div className="max-w-[1100px] mx-auto px-6 text-center z-10 relative">
        <h2 className="text-3xl font-bold text-textPrimary mb-4">About the Team</h2>
        <p className="text-textSecondary max-w-2xl mx-auto mb-16 text-lg">
          Built as a team project to solve real-world customer segmentation problems using machine learning.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {teamInfo.map((member, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-xl hover:-translate-y-1 transition-all duration-300">
              <img 
                src={member.img} 
                alt={member.name}
                className="w-full h-64 object-cover object-center rounded-lg mb-6 bg-surface border border-border"
                onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.name) + '&background=0F1115&color=E8ECF1&size=512' }}
              />
              <h3 className="text-xl font-bold text-textPrimary mb-1">{member.name}</h3>
              <p className="text-sm font-medium text-accent mb-4">{member.role}</p>
              <p className="text-sm text-textSecondary mb-6 leading-relaxed">
                {member.desc}
              </p>
              <a 
                href={member.link} 
                target="_blank" 
                rel="noreferrer" 
                className="text-accent hover:underline text-sm font-medium transition-all"
              >
                LinkedIn &rarr;
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
