import "../styles/services.css"; 
import { motion } from "framer-motion";
import proWeightTraining from "../assets/weighttraining.png"; 
import proCardio from "../assets/cardio.jpg"; 
import proYoga from "../assets/yoga.jpg"; 
import proZumba from "../assets/zumba.jpg"; 
import proDance from "../assets/dance.png";
import Probdprep from "../assets/bdprep3.png";
import Proplprep from "../assets/plprep.jpg";
import Pronp from "../assets/np.jpg";

const ServiceCard = ({ image, title, fullText, index }) => {
  return (
    <motion.div
      className="flip-card"
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      viewport={{ once: true }}
    >
      <div className="flip-card-inner">
        {/* Front Side */}
        <div className="flip-card-front">
          <img src={image} alt={title} />
          <h3>{title}</h3>
        </div>

        {/* Back Side */}
        <div className="flip-card-back">
          <img
            src="https://content3.jdmagicbox.com/comp/yamunanagar/d9/9999p1732.1732.230224113143.p9d9/catalogue/pro-ultimate-gyms-yamuna-nagar-yamunanagar-women-gyms-swng5p48au.jpg"
            alt="Pro Ultimate Logo"
            className="card-logo"
          />
          <h3>{title}</h3>
          <p>{fullText}</p>
        </div>
      </div>
    </motion.div>
  );
};

const Services = () => {
  const services = [
    {
      image: proWeightTraining,
      title: "Weight Training",
      fullText:
        "Weight training is designed to help you build muscle, gain strength, and sculpt your physique using barbells, dumbbells, cables, and machines.",
    },
    {
      image: proCardio,
      title: "Cardio",
      fullText:
        "Cardio sessions improve heart health, stamina, and fat loss through HIIT, LISS, and functional circuits.",
    },
    {
      image: proZumba,
      title: "Zumba",
      fullText:
        "Zumba combines fun dance moves with aerobic steps set to energetic music.",
    },
    {
      image: proYoga,
      title: "Yoga",
      fullText:
        "Our yoga classes focus on alignment, clarity, and flexibility through Hatha, Vinyasa, and restorative flows.",
    },
    {
      image: proDance,
      title: "Dance",
      fullText:
        "Dance classes include Hip-Hop, Bollywood, and Freestyle routines that boost agility and confidence.",
    },
    {
      image: Probdprep,
      title: "Bodybuilding Prep",
      fullText:
        "Our bodybuilding prep includes bulking, cutting, peak week protocols, and posing practice.",
    },
    {
      image: Proplprep,
      title: "Powerlifting Prep",
      fullText:
        "Powerlifting prep focuses on strength-building cycles for squat, bench, and deadlift.",
    },
    {
      image: Pronp,
      title: "Nutrition Plans",
      fullText:
        "Custom nutrition plans for muscle gain, fat loss, or performance with personalized macros and timing.",
    },
  ];

  return (
    <div className="services-section">
      <motion.h2
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        Our <span className="highlight">Services</span>
      </motion.h2>

      <div className="services-grid">
        {services.map((service, index) => (
          <ServiceCard
            key={index}
            image={service.image}
            title={service.title}
            fullText={service.fullText}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default Services;
