import React, { useRef } from "react";
import {
  useScroll,
  useTransform,
  useReducedMotion,
  motion,
  type MotionValue,
} from "motion/react";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(false);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = (): [number, number] => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [20, 0],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [1, 1] : scaleDimensions(),
  );
  const translate = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, -100],
  );

  return (
    <div
      className="relative flex h-[64rem] items-center justify-center p-2 md:h-[72rem] md:p-16"
      ref={containerRef}
    >
      <div
        className="relative w-full py-10 md:py-32"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="mx-auto max-w-5xl text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 0 1px rgba(34, 211, 238, 0.08), 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 60px 120px -40px rgba(34, 211, 238, 0.18)",
      }}
      className="mx-auto -mt-12 h-[26rem] w-full max-w-5xl rounded-[30px] border border-[#26263a] bg-[#0d0d15] p-2 md:h-[40rem] md:p-5"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-[#08080d]">
        {children}
      </div>
    </motion.div>
  );
};
