import SpeedometerDigits from './OdometerCharacter'

const Speedometer = ({
    sentance = "Insert Random Word"
}: { sentance?: string }) => {
    const words = sentance.split(' ')
  return (
    <div className='flex flex-wrap rounded p-4 shadow text-amber-50'>
        {words.map((word, index) => {
            const characters = word.split('')
            const isLastWord = index === words.length - 1
            return (
                <div key={index} className='flex gap-2'>
                    <div className='flex'>
                      {characters.map((character, charIndex) => (
                          <SpeedometerDigits
                            key={charIndex}
                            character={character}
                            className={isLastWord && charIndex >= characters.length - 2 ? 'bg-amber-200 rounded text-black' : ''}
                          />
                      ))}
                      {index < words.length - 1 && <SpeedometerDigits character=" " />}
                  </div>
                </div>
            )
        })}
    </div>
  )
}

export default Speedometer