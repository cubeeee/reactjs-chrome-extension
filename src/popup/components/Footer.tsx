
import React from 'react'

function Footer() {
	return (
		<footer className="bg-gray-100 py-3 flex flex-row justify-between px-3 w-full box-border">
			<div id="autoOption" className="text-gray-500">v1.5</div>
			<div className="text-gray-500">
				2024 © <span id="year" />
				<a
					className="text-blue-500 ml-1 hover:underline"
					id="options-link"
					target="_blank"
					href="https://netproxy.io/"
				>
					NetProxy
				</a>
				-
				<a
					className="text-blue-500 ml-1 hover:underline"
					id="options-link"
					target="_blank"
					href="https://netproxy.io/"
				>
					Buy Proxy
				</a>
			</div>
			<div></div>
		</footer>
	)
}

export default Footer