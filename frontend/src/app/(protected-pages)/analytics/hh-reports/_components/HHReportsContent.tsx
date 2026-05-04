'use client'

import ReportsHHProjectionContainer from './ReportsHHProjectionContainer'
import ReportsHHDetailContainer from './ReportsHHDetailContainer'

const HHReportsContent = () => {
    return (
        <div className="relative flex flex-col gap-4 w-full mt-4">
            <ReportsHHProjectionContainer />
            <ReportsHHDetailContainer />
        </div>
    )
}

export default HHReportsContent
