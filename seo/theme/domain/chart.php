<?

$domain = $p1;
if(!$day = $p2) $day = util::now()->notime()."";

$current = mod_action::current();
$params = $current->params();
$from = $params["from_date"];
$to = $params["to_date"];



if(!$from){    
    $from = util::date($day)->shift(-60*60*24*100);  
}

if(!$to) {
    $to = util::date($day)->shift(60*60*24*2); 
}



$range = (util::date($to)->notime()->stamp() - util::date($from)->notime()->stamp())/24/60/60;



$items = seo_query_position::all()
    ->gt("date",$from)
    ->lt("date",$to)
    ->eq("queryID",$domain->queries()->distinct("id"))
    ->limit(0);

// Выбираем все позиции
$pp = array();
foreach($items as $item)
    $pp[$item->data("queryID")][$item->data("engineID")][$item->data("date")] = $item->data("position");
    
$queriesCount = $domain->queries()->count();
    
foreach($domain->engines() as $engine) {
    $chart = google_chart::create()->width(900)->height(400)->title($engine->title());
    
    $data = array();
    $chart->col("День","string");
    foreach($domain->queries() as $query)
        $chart->col($query->title());
    
    for($i=$range;$i>=0;$i--) {
        $time = util::date($to)->shift(-60*60*24*$i)->notime();
        $row = array($time->notime()->txt());
        $prow = array($time->notime()->txt());
        $complete = 0;
        foreach($domain->queries() as $query) {
            $p = $pp[$query->id()][$engine->id()][$time.""]*1;
            if($p>50 |$p==0) $p = null;
            if($p>0 && $p<=10) $complete++;
            $row[] = $p;
        }
        $chart->row($row);
        $percent[$time->notime()->txt()][$engine->title()] = $complete/$queriesCount*100;
    }
    
    $chart->exec();
}

// Строим диаграму процента выполнения
$pchart = google_chart::create()->width(900)->height(400)->title("% Исполнения");
$pchart->col("Дата","string");
foreach($domain->engines() as $engine)
    $pchart->col($engine->title());
foreach($percent as $day=>$engines) {
    array_unshift($engines,$day);
    $engines = array_values($engines);
    $pchart->row($engines);
}
$pchart->exec();

?>