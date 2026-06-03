<Macro name="Logfile pro Zeile 1 Vorgang" Ctrl="no" Alt="no" Shift="no" Key="0">
	<Action type="3" message="1700" wParam="0" lParam="0" sParam="" />
	<Action type="3" message="1601" wParam="0" lParam="0" sParam="(\r\n|\n)([^R])" />
	<Action type="3" message="1625" wParam="0" lParam="2" sParam="" />
	<Action type="3" message="1602" wParam="0" lParam="0" sParam="\t$2" />
	<Action type="3" message="1702" wParam="0" lParam="768" sParam="" />
	<Action type="3" message="1701" wParam="0" lParam="1609" sParam="" />
</Macro>

<Macro name="Zeilenumbruch rn to n" Ctrl="no" Alt="no" Shift="no" Key="0">
	<Action type="3" message="1700" wParam="0" lParam="0" sParam="" />
	<Action type="3" message="1601" wParam="0" lParam="0" sParam="\r\n" />
	<Action type="3" message="1625" wParam="0" lParam="1" sParam="" />
	<Action type="3" message="1602" wParam="0" lParam="0" sParam="\n" />
	<Action type="3" message="1702" wParam="0" lParam="768" sParam="" />
	<Action type="3" message="1701" wParam="0" lParam="1609" sParam="" />
</Macro>

<Macro name="C4-Logfile Info1 in Zeile entfernen" Ctrl="no" Alt="no" Shift="no" Key="0">
	<Action type="3" message="1700" wParam="0" lParam="0" sParam="" />
	<Action type="3" message="1601" wParam="0" lParam="0" sParam="(,[0-9]{3})\[(.*)\s-\s" />
	<Action type="3" message="1625" wParam="0" lParam="2" sParam="" />
	<Action type="3" message="1602" wParam="0" lParam="0" sParam="$1 (...) " />
	<Action type="3" message="1702" wParam="0" lParam="768" sParam="" />
	<Action type="3" message="1701" wParam="0" lParam="1609" sParam="" />
</Macro>

<Macro name="Log Subzeilen loeschen1" Ctrl="no" Alt="no" Shift="no" Key="0">
	<Action type="3" message="1700" wParam="0" lParam="0" sParam="" />
	<Action type="3" message="1601" wParam="0" lParam="0" sParam="" />
	<Action type="3" message="1625" wParam="0" lParam="2" sParam="" />
	<Action type="3" message="1702" wParam="0" lParam="16" sParam="" />
	<Action type="3" message="1701" wParam="0" lParam="1633" sParam="" />
	<Action type="3" message="1700" wParam="0" lParam="0" sParam="" />
	<Action type="3" message="1601" wParam="0" lParam="0" sParam="([\s]{4}(java|app))|(\t(at|\.\.\.))" />
	<Action type="3" message="1625" wParam="0" lParam="2" sParam="" />
	<Action type="3" message="1702" wParam="0" lParam="784" sParam="" />
	<Action type="3" message="1701" wParam="0" lParam="1615" sParam="" />
	<Action type="2" message="0" wParam="43021" lParam="0" sParam="" />
</Macro>

<Macro name="Log Subzeilen löschen (nicht R4...)" Ctrl="no" Alt="no" Shift="no" Key="0">
	<Action type="3" message="1700" wParam="0" lParam="0" sParam="" />
	<Action type="3" message="1601" wParam="0" lParam="0" sParam="^R4" />
	<Action type="3" message="1625" wParam="0" lParam="2" sParam="" />
	<Action type="3" message="1702" wParam="0" lParam="784" sParam="" />
	<Action type="3" message="1701" wParam="0" lParam="1615" sParam="" />
	<Action type="2" message="0" wParam="43021" lParam="0" sParam="" />
</Macro>

<Macro name="slow request markieren" Ctrl="no" Alt="no" Shift="no" Key="0">
	<Action type="3" message="1700" wParam="0" lParam="0" sParam="" />
	<Action type="3" message="1601" wParam="0" lParam="0" sParam="slow request [0-9\.]+ (s|m)" />
	<Action type="3" message="1625" wParam="0" lParam="2" sParam="" />
	<Action type="3" message="1702" wParam="0" lParam="784" sParam="" />
	<Action type="3" message="1701" wParam="0" lParam="1615" sParam="" />
</Macro>

<Macro name="em_module.log Sprechwunsch" Ctrl="no" Alt="no" Shift="no" Key="0">
	<Action type="3" message="1700" wParam="0" lParam="0" sParam="" />
	<Action type="3" message="1601" wParam="0" lParam="0" sParam="" />
	<Action type="3" message="1625" wParam="0" lParam="2" sParam="" />
	<Action type="3" message="1702" wParam="0" lParam="16" sParam="" />
	<Action type="3" message="1701" wParam="0" lParam="1633" sParam="" />
	<Action type="3" message="1700" wParam="0" lParam="0" sParam="" />
	<Action type="3" message="1601" wParam="0" lParam="0" sParam="FMSStatus:Sprechwunsch|status=FMSStatus:Sprechwunsch|setFmsInfoStatus: sprechwunsch|NatsPublish emFmsChange (.*)fms_info_status_zeit { seconds" />
	<Action type="3" message="1625" wParam="0" lParam="2" sParam="" />
	<Action type="3" message="1702" wParam="0" lParam="528" sParam="" />
	<Action type="3" message="1701" wParam="0" lParam="1615" sParam="" />
</Macro>