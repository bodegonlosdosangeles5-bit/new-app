import { motion } from "framer-motion"
import { useState } from "react"

export default function TarjetasMetalicasGrid() {
  const tarjetas = [
    { titulo: "Gestión de Inventario", texto: "Controlá tus productos y exportá reportes en PDF." },
    { titulo: "Producción", texto: "Supervisá tus lotes, materias primas y tiempos de elaboración." },
    { titulo: "Ventas", texto: "Monitoreá tus pedidos y clientes desde un solo lugar." },
    { titulo: "Depósito", texto: "Organizá los pasillos, racks y niveles de almacenamiento." },
    { titulo: "Formulaciones", texto: "Crea, edita y guarda tus fórmulas químicas fácilmente." },
    { titulo: "Reportes", texto: "Generá informes descargables en PDF con un clic." },
  ]

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10">
      <h2 className="text-3xl font-bold text-yellow-400 mb-10">Panel de Control</h2>
      
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
        {tarjetas.map((card, i) => (
          <TarjetaMetalica key={i} titulo={card.titulo} texto={card.texto} />
        ))}
      </div>

      {/* Botón general */}
      <motion.button
        whileHover={{
          scale: 1.1,
          rotateX: 4,
          rotateY: -4,
          boxShadow: "0px 0px 25px rgba(255, 215, 0, 0.6)",
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 250, damping: 15 }}
        className="mt-12 px-8 py-3 bg-yellow-500 text-black font-semibold rounded-xl 
                   shadow-md transition-colors duration-300 hover:bg-yellow-400"
      >
        Crear nuevo registro
      </motion.button>
    </div>
  )
}

interface TarjetaMetalicaProps {
  titulo: string
  texto: string
}

function TarjetaMetalica({ titulo, texto }: TarjetaMetalicaProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{
        scale: 1.07,
        rotateX: 6,
        rotateY: -6,
        boxShadow: "0px 8px 24px rgba(255, 215, 0, 0.4)",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 10 }}
      className="relative bg-neutral-900 border border-neutral-800 rounded-2xl 
                 p-8 text-center overflow-hidden cursor-pointer
                 transition-colors duration-300 hover:border-yellow-400"
    >
      {/* Brillo dorado en movimiento */}
      <motion.div
        initial={{ left: "-150%" }}
        animate={hovered ? { left: "150%" } : { left: "-150%" }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="absolute top-0 w-1/3 h-full bg-gradient-to-r 
                   from-transparent via-yellow-400/40 to-transparent skew-x-12"
      ></motion.div>

      <h3 className="text-yellow-400 text-xl font-semibold mb-3">{titulo}</h3>
      <p className="text-gray-300">{texto}</p>
    </motion.div>
  )
}
