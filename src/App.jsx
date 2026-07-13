
import './App.css'
import Home from './Components/Home'
import ImageMarquee from './Components/ImageMarquee'
import PinnedFeatureScroll from './Components/PinnedFeatureScroll'
import GridBoxHero from './Components/GridBoxHero'
import TextRevealHero from './Components/TextRevealHero'
function App() {


  return (
    <>
    <div className="w-full h-full bg-[#101512]">
      <Home />
      <ImageMarquee />
      <PinnedFeatureScroll/>
      <GridBoxHero/>
     
      </div>
    </>
  )
}

export default App
